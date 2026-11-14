import React from "react";
import { useSaleorAuthContext } from "@saleor/auth-sdk/react";
import { SignInFormContainer, type SignInFormContainerProps } from "../Contact/SignInFormContainer";
import { ContactPassengerForm } from "../ContactPassengerForm";
import { Button } from "@/checkout/components/Button";
import { useUser } from "@/checkout/hooks/useUser";

interface SignedInUserProps extends Pick<SignInFormContainerProps, "onSectionChange"> {
	onSignOutSuccess: () => void;
	onEmailChange: (email: string) => void;
	onContinueToPayment?: () => void;
	onPassengerNamesChange?: (names: string[]) => void;
}

export const SignedInUser: React.FC<SignedInUserProps> = ({
	onSectionChange,
	onSignOutSuccess,
	onEmailChange,
	onContinueToPayment,
	onPassengerNamesChange,
}) => {
	const { signOut } = useSaleorAuthContext();
	const { user } = useUser();

	return (
		<SignInFormContainer title="Votre compte" onSectionChange={onSectionChange}>
			<div className="mb-4 flex flex-col space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
							Information du compte
						</p>
						<p className="text-lg font-bold text-gray-900">
							{user?.firstName} {user?.lastName}
						</p>
						<p className="text-sm font-medium text-secondary">{user?.email?.split("@")[0]}</p>
					</div>
					<Button
						ariaLabel="Déconnexion"
						variant="tertiary"
						onClick={() => {
							signOut();
							onSignOutSuccess();
						}}
						label="Se déconnecter"
						className="h-auto p-0 text-sm underline"
					/>
				</div>
			</div>

			<ContactPassengerForm
				onEmailChange={onEmailChange}
				email={user?.email || ""}
				onContinueToPayment={onContinueToPayment}
				onPassengerNamesChange={onPassengerNamesChange}
				showPhoneInput={true}
			/>
		</SignInFormContainer>
	);
};
