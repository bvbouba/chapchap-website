// src/actions/addToCart.ts
"use server";

import { revalidatePath } from "next/cache";
import { invariant } from "ts-invariant";
import * as Checkout from "@/lib/checkout";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument } from "@/gql/graphql";
import { deleteLineFromCheckout } from "@/app/[channel]/(main)/cart/actions";

/**
 * Server action to add a product variant to the user's checkout.
 */
export async function addToCartAction({ channel, variantId }: { channel: string; variantId: string }) {
	const checkout = await Checkout.findOrCreate({
		checkoutId: await Checkout.getIdFromCookies(channel),
		channel,
	});

	invariant(checkout, "Checkout could not be created");

	await Checkout.saveIdToCookie(channel, checkout.id);

	checkout.lines.map((line) => deleteLineFromCheckout({ lineId: line.id, checkoutId: checkout.id }));

	if (!variantId) return;

	const { checkoutLinesAdd } = await executeGraphQL(CheckoutAddLineDocument, {
		variables: {
			id: checkout.id,
			productVariantId: decodeURIComponent(variantId),
		},
		cache: "no-cache",
	});
	revalidatePath("/cart");
	return {
		checkout: checkoutLinesAdd?.checkout,
		errors: checkoutLinesAdd?.errors,
	};
}
