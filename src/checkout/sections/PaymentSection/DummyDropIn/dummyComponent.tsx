"use client";

import { dummyGatewayId } from "./types";
import { Button } from "@/checkout/components";
import { useTransactionInitializeMutation } from "@/checkout/graphql";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useCheckoutComplete } from "@/checkout/hooks/useCheckoutComplete";

// Basic implementation of the test gateway:
// https://github.com/saleor/dummy-payment-app/

export const DummyComponent = () => {
    const { showCustomErrors } = useAlerts();

    const { checkout } = useCheckout();
    const [transactionInitializeState, transactionInitialize] = useTransactionInitializeMutation();
    const {onCheckoutComplete, completingCheckout} = useCheckoutComplete()
    const isInProgress = completingCheckout || transactionInitializeState.fetching;

    const onInitalizeClick = () => {
        void transactionInitialize({
            checkoutId: checkout.id,
            paymentGateway: {
                id: dummyGatewayId,
                data: {
                    "event": {
                        "includePspReference": true,
                        "type": "CHARGE_SUCCESS"
                    }
                },
            },
        }).catch((err) => {
            console.error("Un problème est survenu avec la passerelle de paiement fictive :", err);
        }).then((_) => {
            return onCheckoutComplete()
        }).then((res) => {
            if(res?.apiErrors){
                res.apiErrors.forEach((error) => {
                    showCustomErrors([{ message: error.message }]);
                });
            }
        })
    }

    if(isInProgress){
        return <Button className="bg-secondary hover:bg-secondary-dark" variant="primary" disabled={true} label="Traitement du paiement en cours..."/>
    }

    return (
        <Button className="bg-secondary hover:bg-secondary-dark" variant="primary" onClick={onInitalizeClick} label="Effectuer le paiement et créer la commande"/>        
    );
};