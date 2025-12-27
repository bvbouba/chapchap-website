import { useMemo, useRef } from "react";
import { array, object, string, type Schema } from "yup";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import {
    useCheckoutUpdateStateActions,
    useCheckoutUpdateStateChange,
} from "@/checkout/state/updateStateStore";
import { useFormSubmit } from "@/checkout/hooks/useFormSubmit";
import { hasErrors, useForm } from "@/checkout/hooks/useForm";
import { useErrorMessages } from "@/checkout/hooks/useErrorMessages";
import { CountryCode } from "@/gql/graphql";
import { updateCheckoutContactInfo } from "@/actions";

export interface Passenger {
    firstName: string;
    lastName: string;
}

export interface GuestUserFormData {
    email: string;
    phone: string;
    passengers: Passenger[];
}

interface GuestUserFormProps {
    initialEmail: string;
    onContinueToPayment?: () => void;
}

export const useGuestUserForm = ({ initialEmail, onContinueToPayment }: GuestUserFormProps) => {
    const { checkout } = useCheckout();
    const { setSubmitInProgress } = useCheckoutUpdateStateActions();
    const { errorMessages } = useErrorMessages();
    const { setCheckoutUpdateState } = useCheckoutUpdateStateChange("checkoutContactUpdate");

    const validationSchema = object({
        phone: string().required(errorMessages.required),
        email: string().email(errorMessages.invalid).optional(),
        passengers: array()
            .of(
                object({
                    firstName: string().required(errorMessages.required),
                    lastName: string().required(errorMessages.required),
                }),
            )
            .min(1, "Au moins un passager est requis"),
    }) as Schema<GuestUserFormData>;

    // ✅ PHASE 1: Capture data ONLY when the component first mounts.
    // This prevents the "reverting" during submission.
    const initialValues = useMemo(() => {
        const quantity = checkout.lines?.[0]?.quantity || 1;
        const existingPassengers = checkout.note?.split(";").map((p) => {
            const [lastName, firstName] = p.split(",");
            return { lastName: lastName || "", firstName: firstName || "" };
        }) || [];

        const passengers = Array.from({ length: quantity }, (_, i) => {
            return existingPassengers[i] || {
                firstName: checkout.billingAddress?.firstName || "",
                lastName: checkout.billingAddress?.lastName || "",
            };
        });

        return {
            email: initialEmail || (checkout.email !== "anonymous@chapchaptickets.com" ? checkout.email : "") || "",
            phone: checkout.billingAddress?.phone || "",
            passengers,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkout.id]); // ONLY re-run if the entire checkout session changes

    const onSubmit = useFormSubmit<GuestUserFormData, typeof updateCheckoutContactInfo>(
        useMemo(
            () => ({
                scope: "checkoutContactUpdate",
                onSubmit: async (data) => {                    
                    // Redundancy check
                    if (data.email === checkout.email && data.customerNote === checkout.note) {
                        return { data: { checkoutContactUpdate: { checkout, errors: [] } }, error: undefined };
                    }
                    
                    return await updateCheckoutContactInfo(data);
                },
                shouldAbort: ({ formData, formHelpers: { validateForm } }) => hasErrors(validateForm(formData)),
                parse: ({ email, phone, passengers }) => {
                    const customerNote = passengers.map((p) => `${p.lastName},${p.firstName}`).join(";");
                    const firstPassenger = passengers[0] || { firstName: "", lastName: "" };
                    return {
                        checkoutId: checkout.id,
                        email,
                        address: {
                            phone,
                            firstName: firstPassenger.firstName,
                            lastName: firstPassenger.lastName,
                            country: CountryCode.Ci,
                            city: "Abidjan",
                            streetAddress1: "Abidjan",
                        },
                        customerNote,
                    };
                },
                onStart: () => setSubmitInProgress(true),
                onError: () => setSubmitInProgress(false),
                onSuccess: () => {
                    setCheckoutUpdateState("success");
                    setSubmitInProgress(false);
                    onContinueToPayment?.();
                },
            }),
            [checkout, setSubmitInProgress, setCheckoutUpdateState, onContinueToPayment],
        ),
    );

    const form = useForm<GuestUserFormData>({
        initialValues,
        onSubmit,
        validationSchema,
        validateOnChange: true,
        enableReinitialize: false, // ✅ Crucial: stop Formik from reacting to background checkout changes
    });

    return { ...form, handleChange: (e: any) => { form.handleChange(e); setCheckoutUpdateState("loading"); } };
};