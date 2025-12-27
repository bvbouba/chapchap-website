import { type FC, type ReactNode, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: ReactNode;
    variant?: "primary" | "secondary" | "tertiary";
    ariaLabel?: string;
    ariaDisabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
    label,
    className,
    variant = "primary",
    disabled = false,
    children: _children,
    type = "button",
    ariaLabel,
    ariaDisabled,
    ...rest
}) => {
    const classes = clsx(
        "inline-flex h-10 items-center justify-center whitespace-nowrap rounded border active:outline-none transition-all",
        {
            // ✅ Primary variant: Uses bg-primary and bg-primary-dark
            "bg-primary hover:bg-primary-dark text-white border-transparent px-4 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 disabled:bg-primary-light":
                variant === "primary",

            // ✅ Secondary variant: Uses bg-secondary and bg-secondary-dark
            "bg-secondary hover:bg-secondary-dark text-white border-transparent px-4 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 disabled:bg-secondary-light":
                variant === "secondary",

            // Tertiary variant: Plain text/link style
            "h-auto border-none bg-transparent p-0": variant === "tertiary",
        },
        className,
    );

    return (
        <button
            aria-label={ariaLabel}
            aria-disabled={ariaDisabled}
            disabled={disabled}
            className={classes}
            type={type === "submit" ? "submit" : "button"}
            {...rest}
        >
            {typeof label === "string" ? <span className="font-semibold">{label}</span> : label}
        </button>
    );
};