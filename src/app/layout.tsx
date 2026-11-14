import "./globals.css";
import { Suspense, type ReactNode } from "react";
import { type Metadata } from "next";
import { DraftModeNotification } from "@/ui/components/DraftModeNotification";

export const metadata: Metadata = {
	title: "ChapChap Tickets",
	description: "Réservez vos billets de bus en Côte d'Ivoire.",
	metadataBase: process.env.NEXT_PUBLIC_STOREFRONT_URL
		? new URL(process.env.NEXT_PUBLIC_STOREFRONT_URL)
		: undefined,
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		// Headless UI mutates <html> with data-headlessui-focus-visible on the client.
		<html lang="en" className="min-h-dvh" suppressHydrationWarning>
			<body className="min-h-dvh" suppressHydrationWarning>
				{children}
				<Suspense>
					<DraftModeNotification />
				</Suspense>
			</body>
		</html>
	);
}
