import React from "react";
import { PaymentMethods } from "./PaymentMethods";
import { Title } from "@/checkout/components/Title";

export const PaymentSection = () => {
	return (
		<div className="py-2" data-testid="paymentMethods">
			<Title className="!mb-4">Paiement Mobile Money</Title>
			<p className="mb-4 text-sm text-[#606060]">
				Choisissez votre réseau et validez le débit sur votre téléphone.
			</p>
			<PaymentMethods />
		</div>
	);
};
