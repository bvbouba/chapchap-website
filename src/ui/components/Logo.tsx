"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const ICON_SRC = "/logo.png";
const ICON_ALT = "ChapChap Tickets Logo";
/** Marketplace home — always, even from an operator channel page. */
const MARKETPLACE_HOME = "/ci";

const LogoContent = () => (
	<span className="flex items-center">
		<Image
			src={ICON_SRC}
			alt={ICON_ALT}
			width={240}
			height={56}
			priority
			className="h-12 w-auto object-contain"
		/>
	</span>
);

export const Logo = () => {
	const pathname = usePathname();

	if (pathname === MARKETPLACE_HOME || pathname === "/") {
		return (
			<h1 className="flex items-center" aria-label="homepage">
				<LogoContent />
			</h1>
		);
	}

	return (
		<div className="flex items-center text-xl">
			<Link aria-label="Accueil ChapChap Tickets" href={MARKETPLACE_HOME}>
				<LogoContent />
			</Link>
		</div>
	);
};
