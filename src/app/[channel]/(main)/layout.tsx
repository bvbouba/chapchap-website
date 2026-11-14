import { Suspense, type ReactNode } from "react";
import { Footer } from "@/ui/components/Footer";
import { Header } from "@/ui/components/Header";
import { TripSearchProvider } from "@/context/TripSearchContext";
import { GlobalLoadingProvider } from "@/context/GlobalLoadingContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { SessionTimerProvider } from "@/context/SessionTimerContext";
import { AvailabilityProvider } from "@/context/AvailabilityGuardContext";

export const metadata = {
	title: "ChapChap Tickets",
	description: "Réservez vos billets de bus en Côte d'Ivoire.",
};

export default async function RootLayout(props: {
	children: ReactNode;
	params: Promise<{ channel: string }>;
}) {
	const channel = (await props.params).channel;

	return (
		<Suspense fallback={null}>
			<GlobalLoadingProvider>
				<SessionTimerProvider>
					<TripSearchProvider>
						<ProgressProvider>
							<AvailabilityProvider>
								<Header channel={channel} />
								<div className="flex min-h-[calc(100dvh-64px)] flex-col">
									<main className="flex-1">{props.children}</main>
									<Footer channel={channel} />
								</div>
							</AvailabilityProvider>
						</ProgressProvider>
					</TripSearchProvider>
				</SessionTimerProvider>
			</GlobalLoadingProvider>
		</Suspense>
	);
}
