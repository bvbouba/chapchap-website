"use client";

import { TextInput } from "@/checkout/components/TextInput";
import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Passenger, useGuestUserForm } from "./GuestUser/useGuestUserForm";
import { FormProvider } from "../hooks/useForm/FormProvider";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";

interface ContactPassengerFormProps {
    onEmailChange: (email: string) => void;
    onContinueToPayment?: () => void;
    email: string;
    showPhoneInput?: boolean;
}

export const ContactPassengerForm: React.FC<ContactPassengerFormProps> = ({
    onEmailChange,
    onContinueToPayment,
    email,
    showPhoneInput = true,
}) => {
    const form = useGuestUserForm({ initialEmail: email, onContinueToPayment });
    const { handleChange, values, isSubmitting, setFieldValue, setFieldError, errors, handleSubmit } = form;

    const [termsOpen, setTermsOpen] = useState(false);
    
    // ✅ Initialize ONLY on mount. If values exist, user previously accepted.
    const [acceptedTerms, setAcceptedTerms] = useState(() => {
        return values.passengers.some(p => p.firstName.trim() !== "" && p.lastName.trim() !== "");
    });

    // ✅ Sync Terms Checkbox: If we have data in the checkout (from "Back" navigation), auto-check it
    useEffect(() => {
        const hasExistingData = values.passengers.some(p => p.firstName.trim() !== "" && p.lastName.trim() !== "");
        if (hasExistingData) {
            setAcceptedTerms(true);
        }
    }, [values.passengers]); // Watches passengers specifically

    // ✅ Sync phone/email logic
    useEffect(() => {
        if (email && email !== "anonymous@chapchaptickets.com") {
            const phoneFromEmail = email.split("@")[0];
            const formattedPhone = phoneFromEmail.startsWith("+") ? phoneFromEmail : `+${phoneFromEmail}`;

            if (!values.phone || values.phone === "+") {
                setFieldValue("phone", formattedPhone);
            }
        }
    }, [email, setFieldValue]);

    const handlePaymentClick = async () => {
        if (!acceptedTerms) {
            alert("Veuillez accepter les conditions générales avant de continuer.");
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

        const cleanPhone = currentPhone.replace("+", "");
        const generatedEmail = `${cleanPhone}@chapchaptickets.com`;

        // Update states then submit
        await setFieldValue("email", generatedEmail);
        onEmailChange(generatedEmail);
        handleSubmit();
    };

    return (
        <FormProvider form={form}>
            {showPhoneInput && (
                <section className="mx-auto my-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Informations de contact</h3>
                    <div className="phone-input-container">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Numéro de téléphone <span className="text-red-500">*</span>
                        </label>
                        <PhoneInput
                            country={"ci"}
                            onlyCountries={["ci", "ca"]}
                            value={values.phone}
                            onChange={(phone) => {
                                const formatted = phone.startsWith("+") ? phone : `+${phone}`;
                                setFieldValue("phone", formatted);
                            }}
                            inputStyle={{
                                width: "100%",
                                height: "45px",
                                borderRadius: "8px",
                                border: errors.phone ? "1px solid #ef4444" : "1px solid #e5e7eb",
                            }}
                            buttonStyle={{
                                borderRadius: "8px 0 0 8px",
                                border: errors.phone ? "1px solid #ef4444" : "1px solid #e5e7eb",
                            }}
                            containerClass="mt-1"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone as string}</p>
                        )}
                    </div>
                </section>
            )}

            <section className="mx-auto my-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">Détails du passager</h3>
                <p className="mb-5 text-sm text-gray-600">
                    Les noms doivent correspondre à la pièce d’identité.
                </p>

                {values.passengers.map((p: Passenger, i: number) => (
                    <div key={i} className="mb-6 space-y-3 border-b pb-4 last:border-0">
                        <h4 className="text-base font-medium text-gray-700">Passager {i + 1}</h4>
                        <TextInput required name={`passengers[${i}].lastName`} label="Nom de famille" onChange={handleChange} />
                        <TextInput required name={`passengers[${i}].firstName`} label="Prénom" onChange={handleChange} />
                    </div>
                ))}
            </section>

            <section className="mx-auto my-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Conditions générales</h3>
                <button
                    type="button"
                    className="flex w-full items-center justify-between font-medium text-red-600"
                    onClick={() => setTermsOpen(!termsOpen)}
                >
                    <span>Conditions générales de ChapChap Tickets</span>
                    {termsOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </button>

                {termsOpen && (
                    <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed border border-gray-100">
                        Toutes les réservations sont soumises aux conditions de vente.
                        Billets <strong>non remboursables</strong> et <strong>non échangeables</strong> sauf conditions contraires du transporteur.
                    </div>
                )}

                <div className="mt-4 flex items-center space-x-2">
                    <input
                        id="acceptTerms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary cursor-pointer"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
                        J’accepte les conditions générales.
                    </label>
                </div>

                <button
                    type="button"
                    onClick={handlePaymentClick}
                    disabled={!acceptedTerms || isSubmitting}
                    className={`mt-6 w-full rounded-lg py-4 font-bold text-white transition-all active:scale-[0.98] shadow-md ${acceptedTerms && !isSubmitting
                            ? "bg-secondary hover:bg-secondary-dark shadow-secondary/20"
                            : "bg-gray-400 cursor-not-allowed shadow-none"
                        }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Traitement...</span>
                        </div>
                    ) : (
                        "Continuer vers le paiement"
                    )}
                </button>
            </section>
        </FormProvider>
    );
};