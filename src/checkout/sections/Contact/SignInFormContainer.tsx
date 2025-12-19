import React, { type PropsWithChildren } from "react";
import { Title } from "@/checkout/components/Title";

export interface SignInFormContainerProps {
	title: string;
	redirectSubtitle?: string;
	redirectButtonLabel?: string;
	subtitle?: string;
	onSectionChange: () => void;
}

export const SignInFormContainer: React.FC<PropsWithChildren<SignInFormContainerProps>> = ({
	title,
	redirectButtonLabel,
	redirectSubtitle,
	subtitle,
	onSectionChange,
	children,
}) => {
	return (
		<>
			<section className="mx-auto my-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
				{/* Title */}
				<div className="mb-4 text-center">
					<Title>{title}</Title>

					{redirectSubtitle && <p className="mt-2 text-sm text-gray-600">{redirectSubtitle}</p>}

					{subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
				</div>

				{/* Action Button */}
				{redirectButtonLabel && (
					<div className="mt-6 text-center">
						<button
							onClick={onSectionChange}
							className="rounded-md bg-[#97D700] px-6 py-2 font-semibold text-white transition hover:bg-green-600"
						>
							{redirectButtonLabel}
						</button>
					</div>
				)}
			</section>
			{children}
		</>
	);
};
