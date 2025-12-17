import { type ReactNode } from "react";
import { Footer } from "@/ui/components/Footer";
import { Header } from "@/ui/components/Header";
import { TripSearchProvider } from "@/context/TripSearchContext";
import { GlobalLoadingProvider } from "@/context/GlobalLoadingContext";
import { ProgressProvider } from "@/context/ProgressContext";

export const metadata = {
	title: "Saleor Storefront example",
	description: "Starter pack for building performant e-commerce experiences with Saleor.",
};

export default async function RootLayout(props: {
	children: ReactNode;
	params: Promise<{ channel: string }>;
}) {
	const channel = (await props.params).channel;

	return (
		<GlobalLoadingProvider>
		<TripSearchProvider>
		<ProgressProvider>
			<Header channel={channel} />
			<div className="flex min-h-[calc(100dvh-64px)] flex-col">
				<main className="flex-1">{props.children}</main>
				<Footer channel={channel} />
			</div>
			</ProgressProvider>
		</TripSearchProvider>
		</GlobalLoadingProvider>
	);
}
