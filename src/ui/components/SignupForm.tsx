"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, requestOTP, verifyCode } from "@/actions";
import { CheckoutPhoneInput } from "@/checkout/components/CheckoutPhoneInput";
import { isValidPhoneNumber } from "libphonenumber-js"; 

export default function SignupForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // ✅ 1. Validity Check
        const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
        if (!isValidPhoneNumber(formattedPhone)) {
            setError("Le numéro de téléphone n'est pas valide.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await requestOTP({ phoneNumber: formattedPhone });
            
            if (response.error) {
                setError(response.error);
            } else {
                setStep(2);
            }
        } catch (err) {
            setError("Erreur lors de l'envoi du code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
            const response = await verifyCode({ phoneNumber: formattedPhone, otp });
            if (response.error) {
                setError(response.error);
            } else {
                setStep(3);
            }
        } catch (err) {
            setError("Code invalide ou expiré.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
            const response = await registerUser({
                email: `${formattedPhone}@chapchapticket.com`,
                password,
                firstName: firstName,
                lastName: lastName,
            });
            if (response.error && response.error.length > 0) {
                setError(response.error[0]?.message ?? "Une erreur inconnue est survenue");
            } else {
                router.push("/account/login?message=AccountCreated");
            }
        } catch (err) {
            setError("L'inscription a échoué. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto mt-16 w-full max-w-lg px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Créer un compte</h1>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                            <CheckoutPhoneInput
                                value={phone}
                                onChange={(value) => setPhone(value)}
                                containerClass="w-full"
                                inputClass="!w-full !h-[48px] !rounded-lg !border-gray-200 focus:!ring-2 focus:!ring-secondary !outline-none"
                                buttonClass="!rounded-l-lg !border-gray-200"
                                placeholder="+225..."
                                inputStyle={{ height: "48px", borderRadius: "0.5rem" }}
                                buttonStyle={{ borderRadius: "0.5rem 0 0 0.5rem" }}
                            />
                        </div>
                        <button 
                            disabled={loading || !phone}
                            className="w-full bg-secondary text-white p-3 rounded-lg font-semibold hover:bg-secondary-dark disabled:bg-gray-300 transition"
                        >
                            {loading ? "Chargement..." : "Envoyer le code"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                className="w-full p-3 border rounded-lg text-center text-2xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-secondary outline-none"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <button 
                            disabled={loading}
                            className="w-full bg-secondary text-white p-3 rounded-lg font-semibold hover:bg-secondary-dark disabled:bg-gray-400 transition"
                        >
                            {loading ? "Vérification..." : "Vérifier"}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-gray-500 hover:text-gray-700">
                            Utiliser un autre numéro
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Prénom"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Nom"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button 
                            disabled={loading}
                            className="w-full bg-secondary text-white p-3 rounded-lg font-semibold hover:bg-secondary-dark transition"
                        >
                            {loading ? "Création..." : "Finaliser l'inscription"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}