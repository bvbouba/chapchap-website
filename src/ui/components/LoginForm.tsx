"use client";

import { useState, useTransition } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";
import { isValidPhoneNumber } from "libphonenumber-js";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { loginSubmit } from "@/actions";

export function LoginForm() {
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const [phone, setPhone] = useState("");
	const router = useRouter();

	async function handleLogin(formData: FormData) {
		const fullPhone = phone.startsWith("+") ? phone : `+${phone}`;

		if (!isValidPhoneNumber(fullPhone)) {
			setError("Le numéro de téléphone n'est pas valide.");
			return;
		}

		setError(null);
		const password = formData.get("password")?.toString();

		if (!password) {
			setError("Le mot de passe est requis");
			return;
		}

		const virtualEmail = `${fullPhone}@chapchaptickets.com`;

		startTransition(async () => {
			try {
				const result = await loginSubmit(virtualEmail, password);
				if (result.errors && result.errors.length > 0) {
					setError("Veuillez saisir des identifiants valides");
				} else {
					router.push("/");
					router.refresh();
				}
			} catch (err) {
				setError("Une erreur est survenue lors de la connexion");
			}
		});
	}

	return (
		<div className="mx-auto mt-16 w-full max-w-lg px-4">
			<div className="rounded-xl border bg-white p-8 shadow-md">
				<h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Connexion</h2>

				<form action={handleLogin} className="space-y-4">
					<div>
						<label className="mb-2 block text-sm font-medium text-gray-700">Numéro de téléphone</label>
						<PhoneInput
							country={"ci"}
							onlyCountries={["ci", "ca"]}
							value={phone}
							onChange={(val) => setPhone(val)}
							containerClass="w-full"
							inputClass="!w-full !h-[42px] !rounded !border-gray-300 !bg-neutral-50"
						/>
					</div>

					<div>
						<div className="mb-2 flex items-center justify-between">
							<label className="block text-sm font-medium text-gray-700">Mot de passe</label>
							<LinkWithChannel
								href="/account/resetPassword"
								className="text-sm font-medium text-orange-600 hover:text-orange-500"
							>
								Mot de passe oublié ?
							</LinkWithChannel>
						</div>
						<input
							type="password"
							name="password"
							placeholder="••••••••"
							className="w-full rounded border border-gray-300 bg-neutral-50 px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
							required
						/>
					</div>

					{error && (
						<div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
					)}

					<button
						disabled={isPending}
						className={`w-full rounded px-4 py-3 font-semibold text-white transition ${
							isPending
								? "cursor-not-allowed bg-secondary opacity-70"
								: "bg-secondary shadow-sm hover:bg-secondary-dark"
						}`}
						type="submit"
					>
						{isPending ? "Connexion en cours..." : "Se connecter"}
					</button>
				</form>

				<div className="mt-8 text-center text-sm text-gray-600">
					{/* ✅ Correction de l'apostrophe ici */}
					Vous n&apos;avez pas de compte ?{" "}
					<LinkWithChannel href="/account/signup" className="font-bold text-orange-600 hover:text-orange-500">
						Créer un compte
					</LinkWithChannel>
				</div>
			</div>
		</div>
	);
}
