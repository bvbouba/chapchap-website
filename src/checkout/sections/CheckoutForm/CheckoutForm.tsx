"use client";

import { Suspense, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useUser } from "@/checkout/hooks/useUser";
import { Contact } from "@/checkout/sections/Contact";
import { DeliveryMethods } from "@/checkout/sections/DeliveryMethods";
import { ContactSkeleton } from "@/checkout/sections/Contact/ContactSkeleton";
import { DeliveryMethodsSkeleton } from "@/checkout/sections/DeliveryMethods/DeliveryMethodsSkeleton";
import { AddressSectionSkeleton } from "@/checkout/components/AddressSectionSkeleton";
import { Divider } from "@/checkout/components";
import { UserShippingAddressSection } from "@/checkout/sections/UserShippingAddressSection";
import { GuestShippingAddressSection } from "@/checkout/sections/GuestShippingAddressSection";
import { UserBillingAddressSection } from "@/checkout/sections/UserBillingAddressSection";
import { GuestBillingAddressSection } from "@/checkout/sections/GuestBillingAddressSection";
import { PaymentSection, PaymentSectionSkeleton } from "@/checkout/sections/PaymentSection";
import { getQueryParams } from "@/checkout/lib/utils/url";
import { CollapseSection } from "@/checkout/sections/CheckoutForm/CollapseSection";
import { formatCheckoutMoney, summarizeCheckoutPricing } from "@/checkout/lib/checkoutPricing";

type Props = {
	onPassengerNamesChange?: (names: string[]) => void;
};

/**
 * Same flow as the customer mobile app:
 * 1) Contact + passengers → save
 * 2) Paystack Mobile Money payment UI
 */
export const CheckoutForm = ({ onPassengerNamesChange }: Props) => {
	const { user } = useUser();
	const { checkout } = useCheckout();
	const { passwordResetToken } = getQueryParams();

	const [currentStep, setCurrentStep] = useState(1);
	const [showOnlyContact, setShowOnlyContact] = useState(!!passwordResetToken);

	const pricing = summarizeCheckoutPricing(
		checkout?.lines,
		checkout?.totalPrice?.gross?.amount,
	);
	const totalLabel = formatCheckoutMoney(pricing.total, pricing.currency);

	const handleNext = () => setCurrentStep(2);
	const handleBack = () => setCurrentStep(1);

	const isStep1 = currentStep === 1;
	const isStep2 = currentStep === 2;

	return (
		<div className="flex w-full flex-col">
			{isStep2 ? (
				<div className="mb-4 flex items-center justify-between gap-3">
					<button
						type="button"
						onClick={handleBack}
						className="inline-flex items-center gap-1 text-sm font-medium text-[#404040] transition hover:text-[#111111]"
					>
						<ChevronLeft className="h-4 w-4" />
						Retour
					</button>
					<p className="text-sm font-semibold text-[#111111]">
						Paiement sécurisé{totalLabel ? ` — ${totalLabel}` : ""}
					</p>
				</div>
			) : null}

			{isStep1 ? (
				<div className="flex w-full flex-col">
					<Suspense fallback={<ContactSkeleton />}>
						<Contact
							setShowOnlyContact={setShowOnlyContact}
							onContinueToPayment={handleNext}
							onPassengerNamesChange={onPassengerNamesChange}
						/>
					</Suspense>

					{checkout?.isShippingRequired ? (
						<Suspense fallback={<AddressSectionSkeleton />}>
							<CollapseSection collapse={showOnlyContact}>
								<Divider />
								<div className="py-4" data-testid="shippingAddressSection">
									{user ? <UserShippingAddressSection /> : <GuestShippingAddressSection />}
								</div>
								{user ? <UserBillingAddressSection /> : <GuestBillingAddressSection />}
							</CollapseSection>
						</Suspense>
					) : null}

					<Suspense fallback={<DeliveryMethodsSkeleton />}>
						<DeliveryMethods collapsed={showOnlyContact} />
					</Suspense>
				</div>
			) : null}

			{isStep2 ? (
				<div className="flex w-full flex-col">
					<Suspense fallback={<PaymentSectionSkeleton />}>
						<PaymentSection />
					</Suspense>
				</div>
			) : null}
		</div>
	);
};
