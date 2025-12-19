"use client";

import { Suspense, useState } from "react";
import { ChevronLeft } from "lucide-react"; // 👈 import Lucide icon
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

export const CheckoutForm = () => {
	const { user } = useUser();
	const { checkout } = useCheckout();
	const { passwordResetToken } = getQueryParams();

	const [currentStep, setCurrentStep] = useState(1);
	const [showOnlyContact, setShowOnlyContact] = useState(!!passwordResetToken);

	const totalSteps = 2;
	const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
	const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

	const isStep1 = currentStep === 1;
	const isStep2 = currentStep === 2;

	return (
		<div className="flex w-full flex-col">
			{/* 🔙 Back + Progress Bar Row */}
			<div className="mb-6 flex w-full items-center justify-between">
				{currentStep > 1 ? (
					<button
						onClick={handleBack}
						className="flex items-center font-medium text-gray-700 transition hover:text-gray-900"
					>
						<ChevronLeft className="mr-1 h-4 w-4" />
						Retour
					</button>
				) : (
					<div /> // placeholder to align layout
				)}

				{/* 🟦 Progress Bar */}
				<div className="flex w-2/3 flex-col sm:w-1/2">
					<div className="mb-1 flex justify-between text-sm font-medium text-gray-700">
						<span>
							Étape {currentStep} sur {totalSteps}
						</span>
						<span>{isStep1 ? "Informations & Livraison" : "Paiement"}</span>
					</div>
					<div className="h-2 w-full rounded-full bg-gray-200">
						<div
							className="h-2 rounded-full bg-blue-600 transition-all duration-300"
							style={{ width: `${(currentStep / totalSteps) * 100}%` }}
						/>
					</div>
				</div>
			</div>

			{/* 🧾 Step 1 */}
			{isStep1 && (
				<div className="flex w-full flex-col rounded">
					<Suspense fallback={<ContactSkeleton />}>
						<Contact setShowOnlyContact={setShowOnlyContact} onContinueToPayment={handleNext} />
					</Suspense>

					{checkout?.isShippingRequired && (
						<Suspense fallback={<AddressSectionSkeleton />}>
							<CollapseSection collapse={showOnlyContact}>
								<Divider />
								<div className="py-4" data-testid="shippingAddressSection">
									{user ? <UserShippingAddressSection /> : <GuestShippingAddressSection />}
								</div>
								{user ? <UserBillingAddressSection /> : <GuestBillingAddressSection />}
							</CollapseSection>
						</Suspense>
					)}

					<Suspense fallback={<DeliveryMethodsSkeleton />}>
						<DeliveryMethods collapsed={showOnlyContact} />
					</Suspense>
				</div>
			)}

			{/* 💳 Step 2 */}
			{isStep2 && (
				<div className="flex w-full flex-col rounded">
					<Suspense fallback={<PaymentSectionSkeleton />}>
						<PaymentSection />
					</Suspense>
				</div>
			)}
		</div>
	);
};
