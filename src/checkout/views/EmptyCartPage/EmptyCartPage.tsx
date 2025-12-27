import React from "react";
import { Title } from "@/checkout/components";
import { LinkAsButton } from "@/checkout/components/LinkAsButton";
import { ErrorContentWrapper } from "@/checkout/components/ErrorContentWrapper";

export const EmptyCartPage = () => {
    return (
        <ErrorContentWrapper>
            <Title className="mb-0 text-xl">Votre panier est vide.</Title>
            <p>Ajoutez des articles à votre panier pour continuer.</p>
            <LinkAsButton href="/" variant="secondary">
                Retourner à la boutique
            </LinkAsButton>
        </ErrorContentWrapper>
    );
};