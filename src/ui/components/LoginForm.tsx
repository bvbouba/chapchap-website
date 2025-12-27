"use client";

import { useState, useTransition } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";
import { loginSubmit } from "@/actions";
import { isValidPhoneNumber } from "libphonenumber-js";
import { LinkWithChannel } from "../atoms/LinkWithChannel";

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
            <div className="rounded-xl border p-8 shadow-md bg-white">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Connexion</h2>

                <form action={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Numéro de téléphone
                        </label>
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
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            {/* Forgot Password Link */}
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
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={isPending}
                        className={`w-full rounded px-4 py-3 text-white font-semibold transition ${
                            isPending 
                                ? "bg-secondary cursor-not-allowed opacity-70" 
                                : "bg-secondary hover:bg-secondary-dark shadow-sm"
                        }`}
                        type="submit"
                    >
                        {isPending ? "Connexion en cours..." : "Se connecter"}
                    </button>
                </form>

                {/* Signup Link */}
                <div className="mt-8 text-center text-sm text-gray-600">
                    Vous n'avez pas de compte ?{" "}
                    <LinkWithChannel 
                        href="/account/signup" 
                        className="font-bold text-orange-600 hover:text-orange-500"
                    >
                        Créer un compte
                    </LinkWithChannel>
                </div>
            </div>
        </div>
    );
}