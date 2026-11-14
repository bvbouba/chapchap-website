import { notFound } from "next/navigation";
import { OrderByIdDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { resolveVoyageOperatorLogo } from "@/lib/voyageOperatorLogo";
import { LoginForm } from "@/ui/components/LoginForm";
import { OrderDetailsView } from "@/ui/components/orders/OrderDetailsView";
import type { VoyageOrder } from "@/lib/voyageOrders";

type PageProps = {
	params: Promise<{ channel: string; id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
	const { id } = await params;
	return {
		title: `Voyage · ChapChap Tickets`,
		description: `Détails de la réservation ${decodeURIComponent(id)}`,
	};
}

export default async function OrderDetailsPage({ params }: PageProps) {
	const { id: rawId } = await params;
	const id = decodeURIComponent(rawId);

	let order: VoyageOrder | null = null;
	let unauthorized = false;

	try {
		const data = await executeGraphQL(OrderByIdDocument, {
			variables: { id },
			cache: "no-cache",
		});
		order = (data.order as VoyageOrder | null | undefined) ?? null;
	} catch (err) {
		const message = err instanceof Error ? err.message.toLowerCase() : "";
		if (message.includes("permission") || message.includes("auth") || message.includes("login")) {
			unauthorized = true;
		} else {
			console.error("OrderById failed:", err);
		}
	}

	if (unauthorized) {
		return <LoginForm />;
	}

	if (!order) {
		notFound();
	}

	const operatorLogoUrl = await resolveVoyageOperatorLogo(order);

	return (
		<div className="min-h-[70vh] bg-gradient-to-b from-[#F7F8F4] via-[#F3F4F1] to-[#EEEEF0]">
			<OrderDetailsView order={order} operatorLogoUrl={operatorLogoUrl} />
		</div>
	);
}
