"use server";

import { revalidatePath } from "next/cache";
import { invariant } from "ts-invariant";
import * as Checkout from "@/lib/checkout";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument, CheckoutDeleteLinesDocument } from "@/gql/graphql";

/**
 * Add a trip variant to checkout on the **operator** channel (same as mobile).
 * Faster and correct stock vs creating the cart on the marketplace channel.
 */
export async function addToCartAction({
	channel,
	operatorChannelSlug,
	variantId,
}: {
	/** URL / marketplace channel (fallback if operator slug missing). */
	channel: string;
	/** Operator channel from bus-operator attribute — preferred checkout channel. */
	operatorChannelSlug?: string;
	variantId: string;
}) {
	const checkoutChannel = (operatorChannelSlug || channel).trim();
	invariant(checkoutChannel, "Missing checkout channel");
	if (!variantId) return;

	const checkout = await Checkout.findOrCreate({
		checkoutId: await Checkout.getIdFromCookies(checkoutChannel),
		channel: checkoutChannel,
	});

	invariant(checkout, "Checkout could not be created");

	await Checkout.saveIdToCookie(checkoutChannel, checkout.id);

	const lineIds = checkout.lines.map((line) => line.id).filter(Boolean);
	if (lineIds.length > 0) {
		await executeGraphQL(CheckoutDeleteLinesDocument, {
			variables: {
				checkoutId: checkout.id,
				lineIds,
			},
			cache: "no-cache",
		});
	}

	const { checkoutLinesAdd } = await executeGraphQL(CheckoutAddLineDocument, {
		variables: {
			id: checkout.id,
			productVariantId: decodeURIComponent(variantId),
		},
		cache: "no-cache",
	});

	revalidatePath(`/${checkoutChannel}/cart`);

	return {
		checkout: checkoutLinesAdd?.checkout,
		errors: checkoutLinesAdd?.errors,
		checkoutChannel,
	};
}
