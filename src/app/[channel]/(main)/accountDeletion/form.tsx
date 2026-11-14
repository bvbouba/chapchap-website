"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteAccount, requestAccountDeletion } from "./actions";
import { type UserDetailsFragment } from "@/gql/graphql";
import { logout } from "@/app/actions";

interface Props {
	user?: UserDetailsFragment | null;
	channel: string;
}

function getVerificationHint(user: UserDetailsFragment): string {
	const firstName = user.firstName?.trim();
	if (firstName) return firstName;
	const local = user.email?.split("@")[0]?.trim();
	return local || "";
}

export function AccountDeletionForm({ user, channel }: Props) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [step, setStep] = useState<"verify" | "confirm" | "done">("verify");
	const [confirmInput, setConfirmInput] = useState("");
	const [token, setToken] = useState<string | null>(null);

	const expected = user ? getVerificationHint(user) : "";
	const confirmLabel = user?.firstName?.trim() ? "prénom" : "identifiant";

	useEffect(() => {
		if (!user?.id) {
			router.push(`/${channel}/account/login?redirect=/${channel}/accountDeletion`);
		}
	}, [user, channel, router]);

	const handleVerify = async () => {
		if (!user || !expected) return;

		if (confirmInput.trim().toLowerCase() !== expected.toLowerCase()) {
			setError(`Le ${confirmLabel} ne correspond pas.`);
			return;
		}

		setLoading(true);
		setError(null);

		const storefrontUrl =
			process.env.NEXT_PUBLIC_STOREFRONT_URL ||
			(typeof window !== "undefined" ? window.location.origin : "https://www.chapchapticket.com");

		const request = await requestAccountDeletion(storefrontUrl, channel, true);

		if (!request.success || !request.token) {
			setError(request.error || "Impossible de demander la suppression.");
			setLoading(false);
			return;
		}

		setToken(request.token);
		setStep("confirm");
		setLoading(false);
	};

	const handleDelete = async () => {
		if (!token) return;

		setLoading(true);
		setError(null);

		const deletion = await deleteAccount(token);

		if (!deletion.success) {
			setError(deletion.error || "Erreur inconnue");
			setLoading(false);
			return;
		}

		await logout();
		setStep("done");
		setTimeout(() => router.replace(`/${channel}/goodbye`), 1500);
		setLoading(false);
	};

	if (!user?.id) {
		return (
			<div className="mx-auto mt-16 max-w-lg px-4 text-center text-neutral-600">
				Redirection vers la connexion…
			</div>
		);
	}

	if (step === "done") {
		return (
			<div className="mx-auto mt-16 max-w-lg rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
				<p className="text-lg font-semibold text-[#A6C65A]">Votre compte a été supprimé avec succès.</p>
			</div>
		);
	}

	return (
		<div className="mx-auto mt-16 w-full max-w-lg px-4">
			<div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
				<h1 className="mb-4 text-xl font-bold text-[#EB1700]">Supprimer mon compte</h1>

				{step === "verify" && (
					<>
						<p className="mb-6 text-neutral-600">
							Pour confirmer la suppression de votre compte, saisissez votre {confirmLabel}{" "}
							{expected ? (
								<>
									<strong className="text-neutral-900">({expected})</strong>
								</>
							) : null}
							.
						</p>

						{error && (
							<div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
								{error}
							</div>
						)}

						<input
							type="text"
							value={confirmInput}
							onChange={(e) => setConfirmInput(e.target.value)}
							className="mb-4 w-full rounded border border-neutral-300 bg-neutral-50 px-3 py-2 outline-none focus:ring-2 focus:ring-[#EB1700]/40"
							placeholder={`Entrez votre ${confirmLabel}`}
							autoComplete="off"
						/>

						<button
							type="button"
							onClick={handleVerify}
							disabled={loading || !expected}
							className="w-full rounded bg-[#EB1700] px-4 py-2.5 font-semibold text-white hover:bg-[#c91400] disabled:opacity-50"
						>
							{loading ? "Vérification…" : "Continuer"}
						</button>
					</>
				)}

				{step === "confirm" && (
					<>
						<p className="mb-6 text-neutral-600">
							Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est{" "}
							<strong>irréversible</strong>. Vos billets et historique ne seront plus accessibles.
						</p>

						{error && (
							<div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
								{error}
							</div>
						)}

						<button
							type="button"
							onClick={handleDelete}
							disabled={loading}
							className="w-full rounded bg-[#EB1700] px-4 py-2.5 font-semibold text-white hover:bg-[#c91400] disabled:opacity-50"
						>
							{loading ? "Suppression…" : "Oui, supprimer mon compte"}
						</button>

						<button
							type="button"
							onClick={() => router.back()}
							className="mt-3 w-full rounded border border-neutral-300 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50"
						>
							Annuler
						</button>
					</>
				)}
			</div>
		</div>
	);
}
