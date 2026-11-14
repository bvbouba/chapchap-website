import * as Checkout from "@/lib/checkout";
import { getOperatorChannelSlug } from "@/lib/attribute";
import {
	getTripLines,
	isPlatformFeeLine,
} from "@/lib/ensurePlatformFeeInCheckout";
import { executeGraphQL } from "@/lib/graphql";
import { loadOperatorCardMetaMap } from "@/lib/loadOperatorLogoMap";
import { CheckoutDeleteLinesDocument } from "@/gql/graphql";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { CartDetail } from "@/ui/components/cart/CartDetail";
import { ProgressHeader } from "@/ui/components/ProgressHeader";

export const metadata = {
	title: "Ma Réservation · ChapChap Tickets",
};

/** Keep cart ticket-only (mobile removes fee when leaving checkout). */
async function stripPlatformFeeLines(
	checkout: NonNullable<Awaited<ReturnType<typeof Checkout.find>>>,
) {
	const feeLineIds = checkout.lines.filter(isPlatformFeeLine).map((l) => l.id);
	if (feeLineIds.length === 0) return checkout;

	await executeGraphQL(CheckoutDeleteLinesDocument, {
		variables: { checkoutId: checkout.id, lineIds: feeLineIds },
		cache: "no-cache",
	});

	return (await Checkout.find(checkout.id)) ?? checkout;
}

export default async function Page(props: { params: Promise<{ channel: string }> }) {
	const params = await props.params;
	const checkoutId = await Checkout.getIdFromCookies(params.channel);
	let checkout = await Checkout.find(checkoutId);

	if (!checkout || checkout.lines.length < 1) {
		return (
			<section className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
				<h1 className="text-3xl font-bold text-[#111111]">Aucune réservation</h1>
				<p className="mt-3 text-sm text-[#606060]">
					Il semble que vous n&apos;ayez pas encore sélectionné de trajet.
				</p>
				<LinkWithChannel
					href="/"
					className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#EB1700] px-6 text-sm font-bold text-white transition hover:bg-[#c91400]"
				>
					Rechercher un trajet
				</LinkWithChannel>
			</section>
		);
	}

	checkout = await stripPlatformFeeLines(checkout);

	const tripLines = getTripLines(checkout.lines);
	if (tripLines.length < 1) {
		return (
			<section className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
				<h1 className="text-3xl font-bold text-[#111111]">Aucune réservation</h1>
				<p className="mt-3 text-sm text-[#606060]">
					Il semble que vous n&apos;ayez pas encore sélectionné de trajet.
				</p>
				<LinkWithChannel
					href="/"
					className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#EB1700] px-6 text-sm font-bold text-white transition hover:bg-[#c91400]"
				>
					Rechercher un trajet
				</LinkWithChannel>
			</section>
		);
	}

	const operatorSlug = getOperatorChannelSlug(tripLines[0]?.variant?.attributes);
	const metaMap = await loadOperatorCardMetaMap();
	const operatorMeta = operatorSlug ? metaMap[operatorSlug] ?? null : null;

	return (
		<>
			<ProgressHeader checkout={checkout} />
			<CartDetail checkout={checkout} operatorMeta={operatorMeta} />
		</>
	);
}
