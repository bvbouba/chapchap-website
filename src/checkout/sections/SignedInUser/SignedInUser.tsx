import React from "react";
import { useSaleorAuthContext } from "@saleor/auth-sdk/react";
import { SignInFormContainer, type SignInFormContainerProps } from "../Contact/SignInFormContainer";
import { Button } from "@/checkout/components/Button";
import { useUser } from "@/checkout/hooks/useUser";
import { ContactPassengerForm } from "../ContactPassengerForm";

interface SignedInUserProps extends Pick<SignInFormContainerProps, "onSectionChange"> {
    onSignOutSuccess: () => void;
    onEmailChange: (email: string) => void;
    onContinueToPayment?: () => void;
}

export const SignedInUser: React.FC<SignedInUserProps> = ({ onSectionChange, onSignOutSuccess, onEmailChange, onContinueToPayment }) => {
    const { signOut } = useSaleorAuthContext();
    const { user } = useUser();

    return (
        <SignInFormContainer title="Votre Compte" onSectionChange={onSectionChange}>
            {/* ✅ Enhanced User Info Header showing Name and Phone */}
            <div className="flex flex-col space-y-4 mb-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Information du compte</p>
                        <p className="text-lg font-bold text-gray-900">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-secondary font-medium">
                            {user?.email?.split("@")[0]}
                        </p>
                    </div>
                    <Button 
                        ariaLabel="Déconnexion" 
                        variant="tertiary" 
                        onClick={() => { signOut(); onSignOutSuccess(); }} 
                        label="Se déconnecter" 
                        className="text-sm h-auto p-0 underline"
                    />
                </div>
            </div>

            {/* ✅ Pass showPhoneInput={false} because user is already logged in */}
            <ContactPassengerForm 
                onEmailChange={onEmailChange} 
                email={user?.email || ""}
                onContinueToPayment={onContinueToPayment}
                showPhoneInput={false}
            />
        </SignInFormContainer>
    );
};