"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckoutPhoneInput } from "@/checkout/components/CheckoutPhoneInput";
import { useRouter } from "next/navigation";
import { isValidPhoneNumber } from "libphonenumber-js";
import { finalizePasswordReset, requestPasswordReset, verifyPasswordReset } from "@/actions";

export function ForgotPasswordForm() {
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [phone, setPhone] = useState("");
    const [fullPhone,setFullPhone] = useState("")
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState(""); // Token returned from Step 2

    const router = useRouter();

    useEffect(()=>{
        setFullPhone(phone.startsWith("+") ? phone : `+${phone}`);
    },[phone])

    // STEP 1: Request OTP
    const handleRequestOTP = () => {
        if (!isValidPhoneNumber(fullPhone)) {
            setError("Numéro non valide.");
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await requestPasswordReset({ phoneNumber: fullPhone });
            console.log(result)
            if (result.error && result.error?.length>0) setError(result.error[0].message || "");
            else setStep(2);
        });
    };

    // STEP 2: Verify OTP & Get Reset Token
    const handleVerifyOTP = () => {
        startTransition(async () => {
            const result = await verifyPasswordReset({ phoneNumber: fullPhone, code: otp });
            console.log(result)
            if (result.error && result.error.length>0) {
                setError("Code incorrect ou expiré.");
            } else if (result.token) {
                setResetToken(result.token);
                setStep(3);
                setError(null);
            }
        });
    };

    // STEP 3: Finalize Reset
    const handleFinalize = async (formData: FormData) => {
        const password = formData.get("password")?.toString();
        const confirm = formData.get("confirmPassword")?.toString();

        // 1. Validation for password presence and matching
        if (!password) {
            setError("Le mot de passe est requis.");
            return;
        }

        if (password !== confirm) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        // 2. Prepare the virtual email (phone@domain.com)
        const virtualEmail = `${fullPhone}@chapchapticket.com`;

        startTransition(async () => {
            try {
                // 3. Call resetPassword from the SDK
                // Note: We use the virtualEmail here as the 'email' field
                const result = await finalizePasswordReset({
                    email: virtualEmail,
                    password: password,
                    token: resetToken
                });

                console.log(result)

                // 4. Safely check for errors in the SDK response
                const errors = result.error;

                if (errors && errors.length > 0) {
                    setError(errors[0].message || "Une erreur est survenue.");
                } else {
                    router.push("/login?message=PasswordResetSuccess");
                }
            } catch (err) {
                setError("Impossible de réinitialiser le mot de passe. Veuillez réessayer.");
            }
        });
    };
    return (
        <div className="mx-auto mt-16 w-full max-w-lg px-4">
            <div className="rounded-xl border p-8 shadow-md bg-white">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    {step === 1 && "Mot de passe oublié"}
                    {step === 2 && "Vérification"}
                    {step === 3 && "Nouveau mot de passe"}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                        {error}
                    </div>
                )}

                {/* STEP 1: PHONE INPUT */}
                {step === 1 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Entrez votre numéro pour recevoir un code de réinitialisation.</p>
                        <CheckoutPhoneInput
                            value={phone}
                            onChange={setPhone}
                            inputClass="!w-full !h-[42px] !rounded !border-gray-300 !bg-neutral-50"
                            inputStyle={{ height: "42px", borderRadius: "0.25rem" }}
                            buttonStyle={{ borderRadius: "0.25rem 0 0 0.25rem" }}
                        />
                        <button
                            onClick={handleRequestOTP}
                            disabled={isPending || !phone}
                            className="w-full rounded px-4 py-3 text-white font-semibold bg-secondary hover:bg-secondary-dark transition disabled:bg-gray-300"
                        >
                            {isPending ? "Envoi..." : "Envoyer le code"}
                        </button>
                    </div>
                )}

                {/* STEP 2: OTP INPUT */}
                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Entrez le code envoyé au {fullPhone}</p>
                        <input
                            type="text"
                            placeholder="Code à 6 chiffres"
                            className="w-full rounded border border-gray-300 bg-neutral-50 px-4 py-2 text-center text-xl tracking-widest"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            onClick={handleVerifyOTP}
                            disabled={isPending || otp.length < 4}
                            className="w-full rounded px-4 py-3 text-white font-semibold bg-secondary hover:bg-secondary-dark transition disabled:bg-gray-300"
                        >
                            {isPending ? "Vérification..." : "Vérifier le code"}
                        </button>
                    </div>
                )}

                {/* STEP 3: NEW PASSWORD */}
                {step === 3 && (
                    <form action={handleFinalize} className="space-y-4">
                        <input
                            type="password"
                            name="password"
                            placeholder="Nouveau mot de passe"
                            className="w-full rounded border border-gray-300 bg-neutral-50 px-4 py-2"
                            required
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmer le mot de passe"
                            className="w-full rounded border border-gray-300 bg-neutral-50 px-4 py-2"
                            required
                        />
                        <button
                            disabled={isPending}
                            type="submit"
                            className="w-full rounded px-4 py-3 text-white font-semibold bg-secondary hover:bg-secondary-dark transition"
                        >
                            {isPending ? "Réinitialisation..." : "Changer le mot de passe"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}