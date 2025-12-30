import React from "react";
import { SignInFormContainer, type SignInFormContainerProps } from "../Contact/SignInFormContainer";
import { Button } from "@/checkout/components/Button";
import { PasswordInput } from "@/checkout/components/PasswordInput";
import { useResetPasswordForm } from "@/checkout/sections/ResetPassword/useResetPasswordForm";
import { FormProvider } from "@/checkout/hooks/useForm/FormProvider";

interface ResetPasswordProps extends Pick<SignInFormContainerProps, "onSectionChange"> {
	onResetPasswordSuccess: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onSectionChange, onResetPasswordSuccess }) => {
	const form = useResetPasswordForm({ onSuccess: onResetPasswordSuccess });

	return (
		<SignInFormContainer
			title="Réinitialiser le mot de passe"
			redirectSubtitle="Vous vous souvenez de votre mot de passe ?"
			redirectButtonLabel="Se connecter"
			onSectionChange={onSectionChange}
			subtitle="Veuillez saisir un nouveau mot de passe pour votre compte"
		>
			<FormProvider form={form}>
				<PasswordInput name="password" label="Mot de passe" required />
				<div className="mt-4 flex w-full flex-row items-center justify-end">
					<Button
						ariaLabel="Réinitialiser le mot de passe"
						label="Réinitialiser le mot de passe"
						type="submit"
					/>
				</div>
			</FormProvider>
		</SignInFormContainer>
	);
};
