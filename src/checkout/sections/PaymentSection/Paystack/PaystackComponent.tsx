"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClient } from "urql";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Lightbulb, Lock } from "lucide-react";
import {
	TransactionFlowStrategyEnum,
	TransactionInitializeDocument,
	TransactionProcessDocument,
	type TransactionInitializeMutation,
	type TransactionProcessMutation,
} from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useCheckoutComplete } from "@/checkout/hooks/useCheckoutComplete";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import { formatCheckoutMoney } from "@/checkout/lib/checkoutPricing";
import { CheckoutPhoneInput } from "@/checkout/components/CheckoutPhoneInput";
import { EllipsisLoader } from "@/ui/components/EllipsisLoader";
import {
	CI_MOMO_PROVIDERS,
	type CiMomoProvider,
	detectCiMomoProviderFromPhone,
	maskCiPhone,
	type PaystackMomoInitializeData,
	paystackGatewayId,
} from "./types";

const POLL_MS = 5000;
const WAIT_SECONDS = 180;

function resolveCheckoutEmail(checkout: {
	email?: string | null;
	billingAddress?: { phone?: string | null } | null;
} | null | undefined): string {
	if (checkout?.email) return checkout.email;
	const phone = checkout?.billingAddress?.phone;
	if (phone) return `${phone.replace("+", "")}@chapchapticket.com`;
	return "customer@chapchapticket.com";
}

function formatCountdown(totalSec: number): string {
	const s = Math.max(0, totalSec);
	const m = Math.floor(s / 60);
	const r = s % 60;
	return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}

/** Self-contained Paystack MoMo UI — same flow as the customer mobile app. */
export const PaystackComponent = (_props: { config?: unknown }) => {
	const client = useClient();
	const { checkout, refetch } = useCheckout();
	const { onCheckoutComplete, completingCheckout } = useCheckoutComplete();
	const { showCustomErrors } = useAlerts();

	const initialPhone = checkout?.billingAddress?.phone || "";
	const detectedInitial = detectCiMomoProviderFromPhone(initialPhone);

	const [provider, setProvider] = useState<CiMomoProvider>(detectedInitial || "wave");
	const [providerLockedToWave, setProviderLockedToWave] = useState(false);
	const [phone, setPhone] = useState(initialPhone);
	const [waiting, setWaiting] = useState(false);
	const [displayText, setDisplayText] = useState<string | null>(null);
	const [reference, setReference] = useState<string | null>(null);
	const [transactionId, setTransactionId] = useState<string | null>(null);
	const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);
	const [initFetching, setInitFetching] = useState(false);
	const [processFetching, setProcessFetching] = useState(false);
	const finishingRef = useRef(false);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const amountLabel = formatCheckoutMoney(
		checkout?.totalPrice?.gross?.amount,
		checkout?.totalPrice?.gross?.currency,
	);
	const selectedMeta = useMemo(
		() => CI_MOMO_PROVIDERS.find((p) => p.code === provider),
		[provider],
	);

	useEffect(() => {
		const fromCheckout = checkout?.billingAddress?.phone || "";
		if (fromCheckout && !phone) {
			setPhone(fromCheckout);
			const detected = detectCiMomoProviderFromPhone(fromCheckout);
			if (detected && !providerLockedToWave) setProvider(detected);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- prefill once from checkout
	}, [checkout?.billingAddress?.phone]);

	useEffect(() => {
		return () => {
			if (pollRef.current) clearInterval(pollRef.current);
			if (countdownRef.current) clearInterval(countdownRef.current);
		};
	}, []);

	const applyPhoneChange = (next: string) => {
		setPhone(next);
		if (providerLockedToWave) return;
		const detected = detectCiMomoProviderFromPhone(next);
		if (detected) setProvider(detected);
	};

	const selectProvider = (code: CiMomoProvider) => {
		setProvider(code);
		setProviderLockedToWave(code === "wave");
	};

	const stopTimers = () => {
		if (pollRef.current) clearInterval(pollRef.current);
		pollRef.current = null;
		if (countdownRef.current) clearInterval(countdownRef.current);
		countdownRef.current = null;
	};

	const finishPayment = useCallback(
		async (pspReference: string, txnId: string, { silent }: { silent?: boolean } = {}) => {
			if (finishingRef.current) return false;
			finishingRef.current = true;
			setProcessFetching(true);

			try {
				const { data, error } = await client
					.mutation<TransactionProcessMutation>(TransactionProcessDocument, {
						id: txnId,
						data: { reference: pspReference },
					})
					.toPromise();

				if (error) {
					if (!silent) {
						showCustomErrors([{ message: error.message || "Vérification du paiement échouée." }]);
					}
					finishingRef.current = false;
					return false;
				}

				if (data?.transactionProcess?.errors?.length) {
					if (!silent) {
						showCustomErrors([
							{
								message:
									data.transactionProcess.errors[0].message ||
									"Vérification du paiement échouée.",
							},
						]);
					}
					finishingRef.current = false;
					return false;
				}

				const eventType = data?.transactionProcess?.transactionEvent?.type;
				const failed =
					eventType === "CHARGE_FAILURE" || eventType === "AUTHORIZATION_FAILURE";

				if (failed) {
					stopTimers();
					setWaiting(false);
					showCustomErrors([
						{
							message:
								data?.transactionProcess?.transactionEvent?.message ||
								"Le paiement n'a pas abouti.",
						},
					]);
					finishingRef.current = false;
					return false;
				}

				if (
					eventType === "CHARGE_ACTION_REQUIRED" ||
					eventType === "AUTHORIZATION_ACTION_REQUIRED"
				) {
					finishingRef.current = false;
					return false;
				}

				stopTimers();
				setWaiting(false);
				await refetch?.();
				const result = await onCheckoutComplete();
				if (result?.apiErrors?.length) {
					showCustomErrors([{ message: result.apiErrors[0].message || "Erreur commande" }]);
					finishingRef.current = false;
					return false;
				}
				return true;
			} catch (err) {
				console.error("Paystack MoMo finish error:", err);
				if (!silent) {
					showCustomErrors([{ message: "Impossible de finaliser le paiement." }]);
				}
				finishingRef.current = false;
				return false;
			} finally {
				setProcessFetching(false);
			}
		},
		[client, onCheckoutComplete, refetch, showCustomErrors],
	);

	const startPolling = (pspReference: string, txnId: string) => {
		stopTimers();
		setSecondsLeft(WAIT_SECONDS);
		countdownRef.current = setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					if (countdownRef.current) clearInterval(countdownRef.current);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		let attempts = 0;
		pollRef.current = setInterval(() => {
			attempts += 1;
			if (attempts > Math.ceil((WAIT_SECONDS * 1000) / POLL_MS)) {
				if (pollRef.current) clearInterval(pollRef.current);
				return;
			}
			void finishPayment(pspReference, txnId, { silent: true });
		}, POLL_MS);
	};

	const onPay = async () => {
		if (!checkout?.id) {
			showCustomErrors([{ message: "Session de commande introuvable." }]);
			return;
		}

		const formattedPhone = phone.replace(/\s+/g, "");
		if (!formattedPhone || !isValidPhoneNumber(formattedPhone)) {
			showCustomErrors([
				{ message: "Entrez un numéro Mobile Money valide avec l'indicatif du pays." },
			]);
			return;
		}

		finishingRef.current = false;
		setInitFetching(true);

		try {
			// Use urql client.mutation directly (website uses urql, not Apollo hooks).
			const { data, error } = await client
				.mutation<TransactionInitializeMutation>(TransactionInitializeDocument, {
					checkoutId: checkout.id,
					// MoMo has no real pre-auth — Charge is allowed on storefront checkouts.
					action: TransactionFlowStrategyEnum.Charge,
					paymentGateway: {
						id: paystackGatewayId,
						data: {
							email: resolveCheckoutEmail(checkout),
							checkoutId: checkout.id,
							phone: formattedPhone,
							provider,
						},
					},
				})
				.toPromise();

			if (error) {
				showCustomErrors([
					{ message: error.message || "Impossible de démarrer le paiement Mobile Money." },
				]);
				return;
			}

			if (data?.transactionInitialize?.errors?.length) {
				showCustomErrors([
					{
						message: data.transactionInitialize.errors[0].message || "Paiement refusé",
					},
				]);
				return;
			}

			const payload = data?.transactionInitialize?.data as PaystackMomoInitializeData | null | undefined;
			const txnId = data?.transactionInitialize?.transaction?.id;
			const eventType = data?.transactionInitialize?.transactionEvent?.type;
			const eventMessage = data?.transactionInitialize?.transactionEvent?.message;
			const ref = payload?.reference;
			const initFailed =
				eventType === "AUTHORIZATION_FAILURE" || eventType === "CHARGE_FAILURE";

			if (initFailed || payload?.exception || !ref || !txnId) {
				const isDeliveryFailure =
					typeof eventMessage === "string" &&
					eventMessage.toLowerCase().includes("failed to delivery");
				showCustomErrors([
					{
						message: isDeliveryFailure
							? "Le service de paiement est temporairement inaccessible. Réessayez dans un instant."
							: eventMessage ||
								payload?.displayText ||
								"Impossible de démarrer le paiement Mobile Money.",
					},
				]);
				return;
			}

			setReference(ref);
			setTransactionId(txnId);
			setDisplayText(
				payload.displayText ||
					eventMessage ||
					"Validez le paiement sur votre téléphone.",
			);
			setWaiting(true);

			if (payload.openUrl) {
				window.open(payload.openUrl, "_blank", "noopener,noreferrer");
			}

			startPolling(ref, txnId);
		} catch (err) {
			console.error("Paystack MoMo initialize error:", err);
			showCustomErrors([{ message: "Impossible de démarrer le paiement Mobile Money." }]);
		} finally {
			setInitFetching(false);
		}
	};

	const onConfirmPaid = () => {
		if (!reference || !transactionId) return;
		void finishPayment(reference, transactionId, { silent: false });
	};

	const cancelWaiting = () => {
		stopTimers();
		setWaiting(false);
		finishingRef.current = false;
	};

	const busy = initFetching || processFetching || completingCheckout || finishingRef.current;

	const ctaLabel = amountLabel
		? `Payer ${amountLabel} avec ${selectedMeta?.shortLabel || "Mobile Money"}`
		: `Payer avec ${selectedMeta?.shortLabel || "Mobile Money"}`;

	return (
		<>
			<div className="rounded-2xl border border-[#E8E9EC] bg-white p-5 sm:p-6">
				<p className="text-xs font-bold uppercase tracking-wide text-[#606060]">
					Moyen de paiement
				</p>
				<p className="mt-1 text-sm text-[#404040]">Sélectionnez votre opérateur :</p>

				<div className="mt-4 space-y-2.5">
					{CI_MOMO_PROVIDERS.map((item) => {
						const selected = provider === item.code;
						return (
							<button
								key={item.code}
								type="button"
								onClick={() => selectProvider(item.code)}
								className={`flex w-full items-center gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition ${
									selected
										? "border-[#EB1700] bg-white"
										: "border-[#E2E3E7] bg-[#F7F7F8] hover:border-[#C5C6CA]"
								}`}
								aria-pressed={selected}
							>
								<span
									className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
										selected ? "border-[#EB1700]" : "border-[#D7D8DB]"
									}`}
								>
									{selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#EB1700]" /> : null}
								</span>
								<span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[10px] border border-[#E8E8E8] bg-white">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={item.logoSrc} alt={item.label} className="h-7 w-7 object-contain" />
								</span>
								<span className="flex-1 text-sm font-bold text-[#111111]">{item.label}</span>
							</button>
						);
					})}
				</div>

				<label className="mb-2 mt-5 block text-sm text-[#606060]">
					Numéro de téléphone pour le débit
				</label>
				<CheckoutPhoneInput
					value={phone}
					onChange={(value) => {
						const formatted = value.startsWith("+") ? value : `+${value}`;
						applyPhoneChange(formatted);
					}}
					inputStyle={{
						height: "52px",
						border: "1px solid #D7D8DB",
						backgroundColor: "#F7F7F8",
					}}
					buttonStyle={{
						border: "1px solid #D7D8DB",
						backgroundColor: "#F7F7F8",
					}}
				/>
				{checkout?.billingAddress?.phone ? (
					<p className="mt-2 text-xs text-[#606060]">Pré-rempli depuis la fiche contact</p>
				) : null}

				<div className="mt-4 mb-5 flex gap-2.5 rounded-xl border border-[#FFD4CF] bg-[#FFF7F5] p-3">
					<Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#EB1700]" aria-hidden />
					<div>
						<p className="text-sm font-bold text-[#111111]">Comment valider ?</p>
						<p className="mt-1 text-xs leading-5 text-[#606060]">
							{selectedMeta?.tip ||
								"Vous recevrez une notification ou un SMS d'autorisation sur votre téléphone."}
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={() => void onPay()}
					disabled={busy}
					className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#EB1700] px-4 text-sm font-bold text-white transition hover:bg-[#c91400] disabled:opacity-70"
				>
					{busy ? (
						<EllipsisLoader color="#FFFFFF" dotSize={6} />
					) : (
						<>
							<Lock className="h-4 w-4" aria-hidden />
							{ctaLabel}
						</>
					)}
				</button>
			</div>

			{waiting ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-6">
					<div className="w-full max-w-sm rounded-2xl bg-white px-6 py-7 text-center shadow-xl">
						{selectedMeta ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={selectedMeta.logoSrc}
								alt={selectedMeta.label}
								className="mx-auto h-12 w-12 object-contain"
							/>
						) : null}
						<p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#606060]">
							Confirmation requise
						</p>
						<p className="mt-2 text-base font-bold text-[#111111]">
							Demande{amountLabel ? ` de ${amountLabel}` : ""} envoyée vers{" "}
							{selectedMeta?.shortLabel || "Mobile Money"}
						</p>
						<p className="mt-2 text-sm font-semibold text-[#303030]">{maskCiPhone(phone)}</p>
						<p className="mt-3 text-sm leading-5 text-[#606060]">
							{provider === "wave"
								? "Veuillez ouvrir l'application Wave (ou valider la notification) pour terminer."
								: displayText ||
									"Veuillez valider la transaction sur votre téléphone pour terminer."}
						</p>
						<p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-[#606060]">
							Attente… {formatCountdown(secondsLeft)}
						</p>
						{(initFetching || processFetching || completingCheckout) && (
							<div className="mt-3 flex justify-center">
								<EllipsisLoader color="#EB1700" dotSize={6} />
							</div>
						)}
						<button
							type="button"
							onClick={onConfirmPaid}
							disabled={busy}
							className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#EB1700] text-sm font-bold text-white disabled:opacity-70"
						>
							J&apos;ai confirmé le paiement
						</button>
						<button
							type="button"
							onClick={cancelWaiting}
							className="mt-3 text-sm font-medium text-[#606060] underline"
						>
							Annuler
						</button>
					</div>
				</div>
			) : null}
		</>
	);
};
