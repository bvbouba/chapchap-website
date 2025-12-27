"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { DotsLoader } from "@/ui/components/DotLoader";

type Props = {
    disabled?: boolean;
    checkoutId?: string;
    className?: string;
};

export const CheckoutLink = ({ disabled, checkoutId, className = "" }: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const isDisabled = disabled || isPending;

    const handleNavigation = () => {
        if (isDisabled || !checkoutId) return;

        startTransition(() => {
            router.push(`/checkout?checkout=${checkoutId}`);
        });
    };

    return (
        <button
            type="button"
            data-testid="CheckoutLink"
            disabled={isDisabled}
            onClick={handleNavigation}
            className={`
                inline-flex
                min-w-[180px]  /* ✅ Added min-width to prevent jumping */
                items-center
                justify-center
                rounded border border-transparent
                bg-neutral-900 px-6
                py-3 text-center
                text-sm font-semibold
                uppercase tracking-widest
                text-neutral-50
                transition-all duration-200
                hover:bg-neutral-800
                active:scale-95
                disabled:cursor-not-allowed
                disabled:bg-neutral-400
                ${className}
            `}
        >
            {isPending ? (
                <div className="flex items-center gap-2">
                    <DotsLoader />
                    <span className="tracking-normal uppercase">Patientez...</span>
                </div>
            ) : (
                "Commander"
            )}
        </button>
    );
};