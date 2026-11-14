"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { EllipsisLoader } from "@/ui/components/EllipsisLoader";
import { ensurePlatformFeeInCheckoutAction } from "@/actions/ensurePlatformFeeInCheckout";

type LineLike = {
	variant?: { product?: { slug?: string | null } | null } | null;
} | null;

type Props = {
	disabled?: boolean;
	checkoutId?: string;
	/** Checkout lines — used to skip fee add when already present. */
	lines?: LineLike[] | null;
	className?: string;
};

export const CheckoutLink = ({ disabled, checkoutId, lines, className = "" }: Props) => {
	const router = useRouter();
	const params = useParams<{ channel: string }>();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const isDisabled = disabled || isPending;

	const handleNavigation = () => {
		if (isDisabled || !checkoutId) return;
		setError(null);

		startTransition(async () => {
			const channel = Array.isArray(params.channel) ? params.channel[0] : params.channel;

			// Same as mobile: add platform fee on cart CTA so checkout opens ready.
			const feeResult = await ensurePlatformFeeInCheckoutAction({
				checkoutId,
				channel: channel || "",
				lines,
			});

			if (!feeResult.ok && feeResult.reason === "mutation_error") {
				setError(
					feeResult.message ||
						"Impossible d'ajouter les frais de plateforme au panier.",
				);
				return;
			}

			router.push(`/checkout?checkout=${encodeURIComponent(checkoutId)}`);
		});
	};

	return (
		<div className="w-full">
			<button
				type="button"
				data-testid="CheckoutLink"
				disabled={isDisabled}
				onClick={handleNavigation}
				className={className}
			>
				{isPending ? (
					<span className="inline-flex items-center gap-2">
						<EllipsisLoader color="#FFFFFF" dotSize={6} />
						<span>Préparation…</span>
					</span>
				) : (
					<span className="inline-flex items-center gap-2">
						<Lock className="h-4 w-4" aria-hidden />
						Continuer vers le paiement
						<ArrowRight className="h-4 w-4" aria-hidden />
					</span>
				)}
			</button>
			{error ? <p className="mt-2 text-center text-sm text-[#EB1700]">{error}</p> : null}
		</div>
	);
};
