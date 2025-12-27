import { useCallback, useMemo } from "react";
import { type ErrorCode } from "@/checkout/lib/globalTypes";

export const errorMessages = {
    invalid: "Valeur non valide",
    required: "Ce champ est obligatoire",
    unique: "La valeur doit être unique",
    emailInvalid: "L'adresse e-mail n'est pas valide",
    passwordAtLeastCharacters: "Le mot de passe doit contenir au moins 8 caractères",
    passwordTooShort: "Le mot de passe est trop court (8 caractères minimum).",
    passwordTooSimilar: "Le mot de passe est trop similaire à votre ancien mot de passe.",
    passwordTooCommon: "Ce mot de passe est trop commun. Veuillez en choisir un plus complexe.",
    passwordInvalid: "Le mot de passe fourni n'est pas valide.",
    quantityGreaterThanLimit: "La quantité choisie dépasse la limite autorisée.",
    insufficientStock: "Le stock est insuffisant pour cet article.",
    invalidCredentials: "Identifiants invalides.",
    missingFields: "Champs manquants dans le formulaire d'adresse : ",
} satisfies Record<ErrorCode, string>;

export type ErrorMessages = Record<ErrorCode, string>;

export const useErrorMessages = <TKey extends string = ErrorCode>(customMessages?: Record<TKey, string>) => {
    const messagesToUse = customMessages || errorMessages;

    const getMessageByErrorCode = useCallback(
        (errorCode: string) => {
            const formattedMessage = messagesToUse[errorCode as keyof typeof messagesToUse];
            if (!formattedMessage) {
                // Fixed typo: "trnalsation" -> "translation"
                console.warn(`Traduction manquante : ${errorCode}`);
                return "";
            }
            return formattedMessage;
        },
        [messagesToUse],
    );

    const translatedErrorMessages = useMemo(
        () =>
            Object.keys(messagesToUse).reduce(
                (result, key) => ({
                    ...result,
                    [key]: getMessageByErrorCode(key as TKey),
                }),
                {} as Record<TKey, string>,
            ),
        [getMessageByErrorCode, messagesToUse],
    );

    return {
        errorMessages: translatedErrorMessages,
        getMessageByErrorCode,
    };
};