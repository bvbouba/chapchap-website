"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { LinkWithChannel } from "../atoms/LinkWithChannel";

// Define constants for image source and dimensions
const ICON_SRC = "/logo.png";
const ICON_ALT = "ChapChap Tickets Logo";
const ICON_SIZE = 200; // Adjust size as needed

const LogoContent = () => (
	<div className="place-items-center">
		<Image
			src={ICON_SRC}
			alt={ICON_ALT}
			width={ICON_SIZE}
			height={ICON_SIZE}
			// Add margin to separate the icon from the text
			className="mr-2"
		/>
	</div>
);

export const Logo = () => {
	const pathname = usePathname();

	if (pathname === "/") {
		return (
			<h1 className="flex items-center font-bold" aria-label="homepage">
				<LogoContent />
			</h1>
		);
	}

	return (
		<div className="flex items-center text-xl font-bold">
			<LinkWithChannel aria-label="homepage" href="/">
				<LogoContent />
			</LinkWithChannel>
		</div>
	);
};
