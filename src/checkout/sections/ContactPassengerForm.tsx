"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, Lock } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";

import { FormProvider } from "../hooks/useForm/FormProvider";
import { type Passenger, useGuestUserForm } from "./GuestUser/useGuestUserForm";
import { TextInput } from "@/checkout/components/TextInput";
import { CheckoutPhoneInput } from "@/checkout/components/CheckoutPhoneInput";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { formatCheckoutMoney, summarizeCheckoutPricing } from "@/checkout/lib/checkoutPricing";
import { EllipsisLoader } from "@/ui/components/EllipsisLoader";

interface ContactPassengerFormProps {
	onEmailChange: (email: string) => void;
	onContinueToPayment?: () => void;
	email: string;
	showPhoneInput?: boolean;
	onPassengerNamesChange?: (names: string[]) => void;
}

/**
 * Step 1 of checkout (same as mobile): contact + passengers + terms,
 * then continue to the Paystack payment screen.
 */
export const ContactPassengerForm: React.FC<ContactPassengerFormProps> = ({
	onEmailChange,
	onContinueToPayment,
	email,
	showPhoneInput = true,
	onPassengerNamesChange,
}) => {
	const { checkout } = useCheckout();
	const form = useGuestUserForm({ initialEmail: email, onContinueToPayment });
	const { handleChange, values, isSubmitting, setFieldValue, setFieldError, errors, handleSubmit } =
		form;

	const [termsOpen, setTermsOpen] = useState(false);
	const [acceptedTerms, setAcceptedTerms] = useState(() =>
		values.passengers.some((p) => p.firstName.trim() !== "" && p.lastName.trim() !== ""),
	);
	const [optionalEmail, setOptionalEmail] = useState("");

	const pricing = useMemo(
		() => summarizeCheckoutPricing(checkout?.lines, checkout?.totalPrice?.gross?.amount),
		[checkout?.lines, checkout?.totalPrice?.gross?.amount],
	);
	const totalLabel = formatCheckoutMoney(pricing.total, pricing.currency);
	const isFullyCovered = (pricing.total ?? 0) <= 0;

	useEffect(() => {
		const hasExistingData = values.passengers.some(
			(p) => p.firstName.trim() !== "" && p.lastName.trim() !== "",
		);
		if (hasExistingData) setAcceptedTerms(true);
	}, [values.passengers]);

	useEffect(() => {
		onPassengerNamesChange?.(
			values.passengers.map((p) => `${p.firstName} ${p.lastName}`.trim()).filter(Boolean),
		);
	}, [values.passengers, onPassengerNamesChange]);

	useEffect(() => {
		if (email && email !== "anonymous@chapchapticket.com") {
			const phoneFromEmail = email.split("@")[0];
			const formattedPhone = phoneFromEmail.startsWith("+") ? phoneFromEmail : `+${phoneFromEmail}`;
			if (!values.phone || values.phone === "+") {
				void setFieldValue("phone", formattedPhone);
			}
		}
	}, [email, setFieldValue, values.phone]);

	const handlePaymentClick = () => {
		if (!acceptedTerms) {
			alert(
				"Veuillez accepter les Conditions Générales de ChapChap et la politique d'annulation de la compagnie.",
			);
			return;
		}

		let currentPhone = values.phone.trim();
		if (currentPhone && !currentPhone.startsWith("+")) {
			currentPhone = `+${currentPhone}`;
		}

		if (showPhoneInput && (!currentPhone || currentPhone === "+" || !isValidPhoneNumber(currentPhone))) {
			setFieldError("phone", "Numéro de téléphone invalide");
			return;
		}

		const incomplete = values.passengers.some((p) => !p.firstName.trim() || !p.lastName.trim());
		if (incomplete) {
			alert("Veuillez remplir les noms de tous les passagers.");
			return;
		}

		const cleanPhone = currentPhone.replace("+", "");
		const generatedEmail = optionalEmail.trim() || `${cleanPhone}@chapchapticket.com`;

		void setFieldValue("email", generatedEmail);
		onEmailChange(generatedEmail);
		handleSubmit();
	};

	return (
		<FormProvider form={form}>
			<section className="mx-auto my-4 rounded-2xl border border-[#E8E9EC] bg-white p-5 shadow-sm sm:p-6">
				<h3 className="text-lg font-bold text-[#111111]">1. Informations de contact</h3>
				<p className="mt-1 text-sm text-[#606060]">
					Ce numéro recevra votre e-billet par WhatsApp et SMS.
				</p>

				{showPhoneInput ? (
					<div className="phone-input-container mt-4">
						<label className="mb-2 block text-sm font-medium text-[#404040]">
							Numéro de téléphone (WhatsApp / SMS) <span className="text-[#EB1700]">*</span>
						</label>
						<CheckoutPhoneInput
							error={!!errors.phone}
							value={values.phone}
							onChange={(phone) => {
								const formatted = phone.startsWith("+") ? phone : `+${phone}`;
								void setFieldValue("phone", formatted);
							}}
							containerClass="mt-1"
						/>
						{errors.phone ? (
							<p className="mt-1 text-xs font-medium text-red-500">{errors.phone}</p>
						) : null}
					</div>
				) : null}

				<div className="mt-4">
					<label className="mb-2 block text-sm font-medium text-[#404040]">
						E-mail <span className="font-normal text-[#9CA3AF]">(optionnel — reçu de paiement)</span>
					</label>
					<input
						type="email"
						value={optionalEmail}
						onChange={(e) => setOptionalEmail(e.target.value)}
						placeholder="exemple@email.com"
						className="h-12 w-full rounded-xl border border-[#E2E3E7] px-3 text-sm text-[#111111] outline-none focus:border-[#A6C65A]"
					/>
				</div>
			</section>

			<section className="mx-auto my-4 rounded-2xl border border-[#E8E9EC] bg-white p-5 shadow-sm sm:p-6">
				<h3 className="text-lg font-bold text-[#111111]">2. Détails des passagers</h3>
				<p className="mt-1 text-sm text-[#606060]">
					Les noms doivent correspondre aux pièces d&apos;identité.
				</p>

				{values.passengers.map((_p: Passenger, i: number) => (
					<div key={i} className="mt-5 space-y-3 border-b border-[#F0F1F3] pb-5 last:border-0">
						<h4 className="text-sm font-bold uppercase tracking-wide text-[#606060]">
							Passager {i + 1}
							{i === 0 ? " (Principal)" : ""}
						</h4>
						<div className="grid gap-3 sm:grid-cols-2">
							<TextInput
								required
								name={`passengers[${i}].lastName`}
								label="Nom"
								onChange={handleChange}
							/>
							<TextInput
								required
								name={`passengers[${i}].firstName`}
								label="Prénom"
								onChange={handleChange}
							/>
						</div>
						<div>
							<label className="mb-1.5 block text-sm font-medium text-[#404040]">
								Numéro de pièce d&apos;identité{" "}
								<span className="font-normal text-[#9CA3AF]">(CNI / Passeport — optionnel)</span>
							</label>
							<input
								type="text"
								value={values.passengers[i]?.idNumber || ""}
								onChange={(e) => {
									const next = values.passengers.map((passenger, idx) =>
										idx === i ? { ...passenger, idNumber: e.target.value } : passenger,
									);
									void setFieldValue("passengers", next);
								}}
								placeholder="Ex: CI1234567890"
								className="h-12 w-full rounded-xl border border-[#E2E3E7] px-3 text-sm outline-none focus:border-[#A6C65A]"
							/>
						</div>
					</div>
				))}
			</section>

			<section className="mx-auto my-4 rounded-2xl border border-[#E8E9EC] bg-white p-5 shadow-sm sm:p-6">
				<button
					type="button"
					className="flex w-full items-center justify-between font-medium text-[#EB1700]"
					onClick={() => setTermsOpen(!termsOpen)}
				>
					<span>Conditions générales de ChapChap Tickets</span>
					{termsOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
				</button>

				{termsOpen ? (
					<div className="mt-3 rounded-lg border border-[#F0F1F3] bg-[#FAFAFA] p-4 text-sm leading-relaxed text-[#505050]">
						ChapChap Tickets est une plateforme de billetterie : le transport est assuré par la
						compagnie partenaire. Billets soumis à la politique d&apos;annulation du transporteur.{" "}
						<a
							href="/ci/conditions"
							target="_blank"
							rel="noopener noreferrer"
							className="font-semibold text-[#EB1700] underline"
						>
							Lire les conditions générales complètes
						</a>
						.
					</div>
				) : null}

				<div className="mt-4 flex items-start space-x-2">
					<input
						id="acceptTerms"
						type="checkbox"
						checked={acceptedTerms}
						onChange={(e) => setAcceptedTerms(e.target.checked)}
						className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-[#A6C65A] focus:ring-[#A6C65A]"
					/>
					<label
						htmlFor="acceptTerms"
						className="cursor-pointer select-none text-sm font-medium leading-5 text-[#404040]"
					>
						J&apos;accepte les{" "}
						<a
							href="/ci/conditions"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#EB1700] underline"
							onClick={(e) => e.stopPropagation()}
						>
							Conditions Générales de ChapChap
						</a>{" "}
						et la politique d&apos;annulation de la compagnie.
					</label>
				</div>

				<button
					type="button"
					onClick={handlePaymentClick}
					disabled={!acceptedTerms || isSubmitting}
					className={`mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition active:scale-[0.99] ${
						acceptedTerms && !isSubmitting
							? "bg-[#EB1700] hover:bg-[#c91400]"
							: "cursor-not-allowed bg-neutral-300"
					}`}
				>
					{isSubmitting ? (
						<>
							<EllipsisLoader color="#FFFFFF" dotSize={6} />
							<span>Préparation…</span>
						</>
					) : (
						<>
							<Lock className="h-4 w-4" aria-hidden />
							{isFullyCovered
								? "Valider la commande"
								: `Continuer vers le paiement${totalLabel ? ` — ${totalLabel}` : ""}`}
						</>
					)}
				</button>
			</section>
		</FormProvider>
	);
};
