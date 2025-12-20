import { useMemo } from "react";
import { array, object, string, type Schema } from "yup";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import {
	useCheckoutUpdateStateActions,
	useCheckoutUpdateStateChange,
} from "@/checkout/state/updateStateStore";
import { useCheckoutFormValidationTrigger } from "@/checkout/hooks/useCheckoutFormValidationTrigger";
import { useFormSubmit } from "@/checkout/hooks/useFormSubmit";
import { type ChangeHandler, hasErrors, useForm } from "@/checkout/hooks/useForm";
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
	// ✅ Validation schema
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

	// ✅ Passenger initialization (based on quantity)
	const passengers0 = useMemo(() => {
		const quantity = checkout.lines?.[0]?.quantity || 1;
		// Try to reuse passengers stored in checkout.note if available
		const existingPassengers =
			checkout.note?.split(";").map((p) => {
				const [lastName, firstName] = p.split(",");
				return { lastName: lastName || "", firstName: firstName || "" };
			}) || [];

		// Fill up or truncate to match quantity
		const filled = Array.from({ length: quantity }, (_, i) => {
			return (
				existingPassengers[i] || {
					firstName: checkout.billingAddress?.firstName || "",
					lastName: checkout.billingAddress?.lastName || "",
				}
			);
		});

		return filled;
	}, [checkout.lines, checkout.note, checkout.billingAddress]);

	const defaultFormData: GuestUserFormData = {
		email:
			initialEmail ||
			(checkout.email && checkout.email !== "anonymous@chapchaptickets.com" ? checkout.email : "") ||
			"",
		phone: checkout.billingAddress?.phone || "",
		passengers: passengers0,
	};
	// ✅ Submission logic (auto)
	const onSubmit = useFormSubmit<GuestUserFormData, typeof updateCheckoutContactInfo>(
		useMemo(
			() => ({
				scope: "checkoutContactUpdate",
				onSubmit: async (data) => {
					console.log("🟡 Submitting checkout update with:", data);
					const result = await updateCheckoutContactInfo(data);
					console.log("✅ Checkout update result:", result);
					return result;
				},
				shouldAbort: ({ formData, formHelpers: { validateForm } }) => {
					const errors = validateForm(formData);
					return hasErrors(errors);
				},
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
				onStart: () => {
					console.log("⏳ Starting checkout contact update...");
					setSubmitInProgress(true);
				},
				onError: ({ errors }) => {
					console.error("❌ Checkout contact update error", errors);
					setSubmitInProgress(false);
				},
				onSuccess: () => {
					setCheckoutUpdateState("success");
					console.log("✅ Checkout contact info successfully updated!");
					setSubmitInProgress(false);
					// 🚀 trigger continuation callback here
					onContinueToPayment?.();
				},
			}),
			[checkout.id, setSubmitInProgress, setCheckoutUpdateState],
		),
	);

	const form = useForm<GuestUserFormData>({
		initialValues: defaultFormData,
		onSubmit,
		validationSchema,
		validateOnChange: true,
		validateOnBlur: false,
		initialTouched: { email: true },
	});

	const { handleSubmit, handleChange } = form;

	// trigger auto validation on change
	useCheckoutFormValidationTrigger({
		scope: "guestUser",
		form,
	});

	const onChange: ChangeHandler = async (event) => {
		handleChange(event);
		setCheckoutUpdateState("loading");
	};

	return { ...form, handleChange: onChange, handleSubmit };
};
