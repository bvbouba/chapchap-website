"use client";

import { DotsLoader } from "@/ui/components/DotLoader";

type Props = {
	disabled?: boolean;
	checkoutId?: string;
	className?: string;
	isPending?: boolean;
};

export const CheckoutLink = ({ disabled, checkoutId, className = "", isPending }: Props) => {
	const isDisabled = disabled || isPending;

	return (
		<a
			data-testid="CheckoutLink"
			aria-disabled={isDisabled}
			aria-busy={isPending}
			onClick={(e) => isDisabled && e.preventDefault()}
			href={isDisabled ? undefined : `/checkout?checkout=${checkoutId}`}
			className={`
		inline-flex
		max-w-full
		items-center
		justify-center
        rounded border border-transparent
        bg-neutral-900 px-6
        py-3 text-center
        text-sm font-semibold
        uppercase tracking-widest
        text-neutral-50
        hover:bg-neutral-800
        aria-disabled:cursor-not-allowed
        aria-disabled:bg-neutral-500
        sm:px-16
        ${className}
      `}
		>
			{isPending ? (
				<>
					<DotsLoader />
					<span className="sr-only">Chargement…</span>
				</>
			) : (
				"Commander"
			)}
		</a>
	);
};
