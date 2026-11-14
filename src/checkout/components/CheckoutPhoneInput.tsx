"use client";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

/**
 * Côte d'Ivoire moved to 10-digit national numbers in 2021
 * (e.g. 07 02 46 82 53). react-phone-input-2 still ships the old
 * 8-digit mask (`.. .. .. ..`), which truncates valid numbers.
 */
export const CI_PHONE_MASKS = {
	ci: ".. .. .. .. ..",
} as const;

type Props = {
	value?: string;
	onChange?: (value: string, data: unknown, event: unknown, formattedValue: string) => void;
	error?: boolean;
	country?: string;
	onlyCountries?: string[];
	containerClass?: string;
	placeholder?: string;
	inputClass?: string;
	buttonClass?: string;
	specialLabel?: string;
	inputStyle?: React.CSSProperties;
	buttonStyle?: React.CSSProperties;
};

/** Shared phone field with a corrected CI mask for checkout / auth. */
export function CheckoutPhoneInput({
	error,
	country = "ci",
	onlyCountries = ["ci", "ca"],
	inputStyle,
	buttonStyle,
	...rest
}: Props) {
	return (
		<PhoneInput
			country={country}
			onlyCountries={onlyCountries}
			masks={{ ...CI_PHONE_MASKS }}
			countryCodeEditable={false}
			enableLongNumbers
			inputStyle={{
				width: "100%",
				height: "48px",
				borderRadius: "12px",
				border: error ? "1px solid #ef4444" : "1px solid #E2E3E7",
				...inputStyle,
			}}
			buttonStyle={{
				borderRadius: "12px 0 0 12px",
				border: error ? "1px solid #ef4444" : "1px solid #E2E3E7",
				...buttonStyle,
			}}
			{...rest}
		/>
	);
}
