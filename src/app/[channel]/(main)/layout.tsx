import { type ReactNode } from "react";
import { Providers } from "./Providers";
import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";

export const metadata = {
	title: "ChapChap Tickets",
	description: "Comparez, réservez et voyagez facilement.",
};

export default async function RootLayout(props: {
	children: ReactNode;
	params: Promise<{ channel: string }>;
}) {
	const channel = (await props.params).channel;

	return (
		<Providers>
			<Header channel={channel} />
			<div className="flex min-h-[calc(100dvh-64px)] flex-col">
				<main className="flex-1">{props.children}</main>
				<Footer channel={channel} />
			</div>
		</Providers>
	);
}
