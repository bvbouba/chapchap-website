"use client";

type Props = {
	color?: string;
	dotSize?: number;
	className?: string;
	label?: string;
};

/** Three bouncing dots loader (matches customer mobile EllipsisLoader). */
export function EllipsisLoader({
	color = "#EB1700",
	dotSize = 8,
	className = "",
	label,
}: Props) {
	return (
		<div
			className={`inline-flex flex-col items-center gap-2 ${className}`}
			role="status"
			aria-live="polite"
			aria-label={label || "Chargement"}
		>
			<div className="flex items-center justify-center gap-1.5">
				{[0, 1, 2].map((idx) => (
					<span
						key={idx}
						className="inline-block animate-bounce rounded-full"
						style={{
							width: dotSize,
							height: dotSize,
							backgroundColor: color,
							animationDelay: `${-0.3 + idx * 0.15}s`,
						}}
					/>
				))}
			</div>
			{label ? <span className="text-sm text-[#606060]">{label}</span> : null}
		</div>
	);
}
