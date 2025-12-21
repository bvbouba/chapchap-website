import { AlertIcon, SuccessIcon } from "../../assets/icons";
import { Section } from "./Section";

import { useOrder } from "@/checkout/hooks/useOrder";
import { usePaymentStatus } from "@/checkout/sections/PaymentSection/utils";

const ErrorMessage = ({ message }: { message: string }) => {
    return (
        <>
            <p className="mr-1 text-red-500">{message}</p>
            <AlertIcon />
        </>
    );
};

const SuccessMessage = ({ message }: { message: string }) => {
    return (
        <>
            <p color="success" className="mr-1">
                {message}
            </p>
            <SuccessIcon />
        </>
    );
};

export const PaymentSection = () => {
    const { order } = useOrder();
    const paymentStatus = usePaymentStatus(order);

    return (
        <Section title="Paiement">
            <div data-testid="paymentStatus">
                <div className="flex flex-row items-center">
                    {paymentStatus === "authorized" && (
                        <SuccessMessage message="Nous avons reçu votre autorisation de paiement" />
                    )}

                    {paymentStatus === "paidInFull" && <SuccessMessage message="Nous avons bien reçu votre paiement" />}

                    {paymentStatus === "overpaid" && (
                        <ErrorMessage message="Votre commande a été payée plus que le montant dû. Cela peut être une erreur lors du paiement. Veuillez contacter l'équipe du magasin pour obtenir de l'aide." />
                    )}
                </div>
            </div>
        </Section>
    );
};