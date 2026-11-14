"use client";

import Image from "next/image";
import { Bus } from "lucide-react";

type Props = {
	logoUrl?: string | null;
	alt?: string;
	size?: number;
	className?: string;
};

/** Operator mark for Mes Voyages cards / details. */
export function OperatorLogo({ logoUrl, alt = "Opérateur", size = 36, className = "" }: Props) {
	const url = (logoUrl || "").trim();
	if (url) {
		return (
			<span
				className={`relative inline-flex shrink-0 overflow-hidden rounded-[10px] border border-[#E8E9EC] bg-[#F1F1F1] ${className}`}
				style={{ width: size, height: size }}
			>
				<Image
					src={url}
					alt={alt}
					fill
					unoptimized
					className="object-contain p-0.5"
					sizes={`${size}px`}
				/>
			</span>
		);
	}

	return (
		<span
			className={`inline-flex shrink-0 items-center justify-center rounded-[10px] border border-[#DCE8C8] bg-[#F1F5EB] ${className}`}
			style={{ width: size, height: size }}
			aria-hidden
		>
			<Bus className="text-[#A6C65A]" style={{ width: size * 0.45, height: size * 0.45 }} />
		</span>
	);
}
