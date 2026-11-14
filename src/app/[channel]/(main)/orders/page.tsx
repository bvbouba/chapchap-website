import { CurrentUserOrderListDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { resolveVoyageOperatorLogos } from "@/lib/voyageOperatorLogo";
import { LoginForm } from "@/ui/components/LoginForm";
import { MesVoyages } from "@/ui/components/orders/MesVoyages";
import type { VoyageOrder } from "@/lib/voyageOrders";

export const metadata = {
	title: "Mes Voyages · ChapChap Tickets",
};

export default async function OrderPage() {
	const { me: user } = await executeGraphQL(CurrentUserOrderListDocument, {
		cache: "no-cache",
	});

	if (!user) {
		return <LoginForm />;
	}

	const orders = (user.orders?.edges || []).map(({ node }) => node as unknown as VoyageOrder);
	const operatorLogos = await resolveVoyageOperatorLogos(orders);

	return (
		<div className="min-h-[70vh] bg-gradient-to-b from-[#F7F8F4] via-[#F3F4F1] to-[#EEEEF0]">
			<MesVoyages
				orders={orders}
				operatorLogos={operatorLogos}
				firstName={user.firstName}
				email={user.email}
			/>
		</div>
	);
}
