import React, { useState, useTransition, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import clsx from "clsx";
import { Button } from "@/checkout/components/Button";
import { PasswordInput } from "@/checkout/components/PasswordInput";
import { useSignInForm } from "@/checkout/sections/SignIn/useSignInForm";
import { FormProvider } from "@/checkout/hooks/useForm/FormProvider";
import {
    SignInFormContainer,
    type SignInFormContainerProps,
} from "@/checkout/sections/Contact/SignInFormContainer";
import { finalizePasswordReset, requestPasswordReset, verifyPasswordReset } from "@/actions";
import { useAlerts } from "@/checkout/hooks/useAlerts";

interface SignInProps extends Pick<SignInFormContainerProps, "onSectionChange"> {
    onSignInSuccess: () => void;
    onEmailChange: (phone: string) => void;
    email: string;
}

export const SignIn: React.FC<SignInProps> = ({
    onSectionChange,
    onSignInSuccess,
    onEmailChange,
    email: initialPhone,
}) => {
    // UI State
    const [step, setStep] = useState(1); // 1: Login, 2: OTP, 3: New Password
    const [isPending, startTransition] = useTransition();
    const [resetError, setResetError] = useState<string | null>(null);
    const { showSuccess,showErrors } = useAlerts();
    // Data State for Reset
    const [phone, setPhone] = useState(initialPhone || "");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");

    const fullPhone = phone.startsWith("+") ? phone : `+${phone}`;

    const form = useSignInForm({
        onSuccess: onSignInSuccess,
        initialEmail: initialPhone,
    });

    const { isSubmitting, errors, touched, setFieldValue } = form;

    // Logic for virtual email used by Saleor
    const getVirtualEmail = (rawPhone: string) => {
        const formatted = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`;
        return `${formatted}@chapchaptickets.com`;
    };

    const phoneError = touched.email ? (errors.email as string) : undefined;

    // --- STEP handlers for Reset ---

    const handleRequestOTP = () => {
        if (!isValidPhoneNumber(fullPhone)) {
            setResetError("Numéro de téléphone invalide.");
            return;
        }
        setResetError(null);
        startTransition(async () => {
            const result = await requestPasswordReset({ phoneNumber: fullPhone });
            if (result.error && result.error.length > 0) {
                setResetError(result.error[0].message || "Erreur lors de l'envoi.");
            } else {
                showSuccess("Un code a été envoyé à votre numéro de téléphone.");
                setStep(2); // Move to OTP verification
            }
        });
    };

    const handleVerifyOTP = () => {
        setResetError(null);
        startTransition(async () => {
            const result = await verifyPasswordReset({ phoneNumber: fullPhone, code: otp });
            if (result.error && result.error.length > 0) {
                setResetError("Code incorrect ou expiré.");
            } else if (result.token) {
                setResetToken(result.token);
                showSuccess("Code validé. Vous pouvez maintenant créer votre nouveau mot de passe");
                setStep(3); // Move to New Password
            }
        });
    };

    const handleFinalize = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const password = formData.get("password")?.toString();
        const confirm = formData.get("confirmPassword")?.toString();

        if (password !== confirm) {
            setResetError("Les mots de passe ne correspondent pas.");
            return;
        }

        startTransition(async () => {
            const result = await finalizePasswordReset({
                email: getVirtualEmail(phone),
                password: password || "",
                token: resetToken
            });

            if (result.error && result.error.length > 0) {
                setResetError(result.error[0].message || "Erreur lors de la réinitialisation.");
            } else {
                setResetError(null);
                setStep(1); // Return to login
                showSuccess("Mot de passe réinitialisé avec succès !");
            }
        });
    };

    return (
        <SignInFormContainer
            title={step === 1 ? "Se connecter" : step === 2 ? "Vérification OTP" : "Nouveau mot de passe"}
            redirectSubtitle="Nouveau client ?"
            redirectButtonLabel="Continuer sans compte"
            onSectionChange={onSectionChange}
        >
            {resetError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                    {resetError}
                </div>
            )}

            {/* STEP 1: LOGIN MODE */}
            {step === 1 && (
                <FormProvider form={form}>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-0.5">
                            <label className="flex flex-col">
                                <span className="text-xs text-neutral-700">
                                    Numéro de téléphone <span aria-hidden="true">*</span>
                                </span>
                                <div className="mt-0.5">
                                    <PhoneInput
                                        country={"ci"}
                                        onlyCountries={["ci", "ca"]}
                                        value={phone}
                                        placeholder="" 
                                        onChange={(val) => {
                                            setPhone(val);
                                            const virtualEmail = getVirtualEmail(val);
                                            onEmailChange(virtualEmail);
                                            setFieldValue("email", virtualEmail);
                                        }}
                                        containerClass="!w-full"
                                        inputClass={clsx(
                                            "!w-full !h-[42px] !appearance-none !rounded-md !border-neutral-300 focus:!border-neutral-300 focus:!ring-neutral-200",
                                            { "!border-red-300": phoneError }
                                        )}
                                        buttonClass="!border-neutral-300 !rounded-l-md !bg-white"
                                        specialLabel="" 
                                    />
                                </div>
                            </label>
                            {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
                        </div>

                        <PasswordInput name="password" label="Mot de passe" required />
                        
                        <div className="flex w-full flex-row items-center justify-end gap-4 mt-2">
                            <Button
                                variant="tertiary"
                                label="Mot de passe oublié ?"
                                className="!text-orange-600 hover:!text-orange-500 text-sm font-medium"
                                onClick={handleRequestOTP}
                                disabled={isPending}
                            />
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                label={isSubmitting ? "Connexion..." : "Se connecter"}
                                variant="primary"
                            />
                        </div>
                    </div>
                </FormProvider>
            )}

            {/* STEP 2: VERIFY OTP MODE */}
            {step === 2 && (
                <div className="space-y-4 py-2">
                    <p className="text-sm text-neutral-600">Entrez le code envoyé au {fullPhone}</p>
                    <input
                        type="text"
                        placeholder="Code à 6 chiffres"
                        className="w-full rounded border border-neutral-300 bg-neutral-50 px-4 py-2 text-center text-xl tracking-widest focus:ring-2 focus:ring-neutral-200 outline-none"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <div className="flex gap-3">
                        <Button variant="tertiary" label="Annuler" onClick={() => setStep(1)} />
                        <Button
                            className="flex-1"
                            label={isPending ? "Vérification..." : "Vérifier"}
                            variant="primary"
                            onClick={handleVerifyOTP}
                            disabled={isPending || otp.length < 4}
                        />
                    </div>
                </div>
            )}

            {/* STEP 3: RESET PASSWORD MODE */}
            {step === 3 && (
                <form onSubmit={handleFinalize} className="space-y-4 py-2">
                    <div className="space-y-3">
                        <input
                            type="password"
                            name="password"
                            placeholder="Nouveau mot de passe"
                            className="w-full rounded border border-neutral-300 bg-neutral-50 px-4 py-2 focus:ring-2 focus:ring-neutral-200 outline-none"
                            required
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmer le mot de passe"
                            className="w-full rounded border border-neutral-300 bg-neutral-50 px-4 py-2 focus:ring-2 focus:ring-neutral-200 outline-none"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        label={isPending ? "Changement..." : "Réinitialiser"}
                        variant="primary"
                        disabled={isPending}
                    />
                </form>
            )}
        </SignInFormContainer>
    );
};