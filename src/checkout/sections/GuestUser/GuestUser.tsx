import { SignInFormContainer, type SignInFormContainerProps } from "../Contact/SignInFormContainer";
import { ContactPassengerForm } from "../ContactPassengerForm";

type GuestUserProps = Pick<SignInFormContainerProps, "onSectionChange"> & {
	onEmailChange: (email: string) => void;
	email: string;
	onContinueToPayment?: () => void;
};

export const GuestUser: React.FC<GuestUserProps> = ({ onSectionChange, onEmailChange, email: initialEmail, onContinueToPayment }) => {
    return (
        <SignInFormContainer
            title="Déjà venu ?"
            redirectSubtitle="Connectez-vous pour réserver plus rapidement"
            redirectButtonLabel="SE CONNECTER"
            onSectionChange={onSectionChange}
        >
            <ContactPassengerForm 
                onEmailChange={onEmailChange} 
                email={initialEmail}
                onContinueToPayment={onContinueToPayment}
                showPhoneInput={true}
            />
        </SignInFormContainer>
    );
};