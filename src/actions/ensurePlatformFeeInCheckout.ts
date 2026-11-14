"use server";

import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument, TypedDocumentString } from "@/gql/graphql";
import {
	isPlatformFeeLine,
	PLATFORM_FEE_PRODUCT_SLUG,
} from "@/lib/ensurePlatformFeeInCheckout";

export type EnsurePlatformFeeResult =
	| { ok: true }
	| {
			ok: false;
			reason: "no_channel" | "no_product" | "mutation_error";
			message?: string;
	  };

type LineLike = {
	variant?: { product?: { slug?: string | null } | null } | null;
} | null;

type PlatformFeeProductQuery = {
	product?: {
		id: string;
		defaultVariant?: { id: string } | null;
		variants?: Array<{ id: string }> | null;
	} | null;
};

type PlatformFeeProductVariables = { slug: string; channel: string };

/** Minimal product lookup — avoids heavy ProductDetails on the cart CTA. */
const PlatformFeeProductDocument = new TypedDocumentString(`
	query PlatformFeeProduct($slug: String!, $channel: String!) {
		product(slug: $slug, channel: $channel) {
			id
			defaultVariant { id }
			variants { id }
		}
	}
`) as unknown as TypedDocumentString<PlatformFeeProductQuery, PlatformFeeProductVariables>;

/**
 * Same as mobile cart → checkout: add platform-fee line before navigating
 * so checkout loads with the final total already in place.
 */
export async function ensurePlatformFeeInCheckoutAction({
	checkoutId,
	channel,
	lines,
}: {
	checkoutId: string;
	channel: string;
	lines?: LineLike[] | null;
}): Promise<EnsurePlatformFeeResult> {
	if (lines?.some(isPlatformFeeLine)) {
		return { ok: true };
	}

	const channelSlug = channel.trim();
	if (!channelSlug) {
		return { ok: false, reason: "no_channel" };
	}

	try {
		const { product } = await executeGraphQL(PlatformFeeProductDocument, {
			variables: { slug: PLATFORM_FEE_PRODUCT_SLUG, channel: channelSlug },
			cache: "no-cache",
			withAuth: false,
		});

		const variantId = product?.defaultVariant?.id || product?.variants?.[0]?.id;
		if (!variantId) {
			// Fee product not listed on this channel — continue without blocking checkout.
			return { ok: false, reason: "no_product" };
		}

		const { checkoutLinesAdd } = await executeGraphQL(CheckoutAddLineDocument, {
			variables: {
				id: checkoutId,
				productVariantId: variantId,
			},
			cache: "no-cache",
		});

		const errors = checkoutLinesAdd?.errors ?? [];
		if (errors.length) {
			return {
				ok: false,
				reason: "mutation_error",
				message: errors.map((e) => e?.message).filter(Boolean).join(", ") || undefined,
			};
		}

		return { ok: true };
	} catch (err) {
		console.error("ensurePlatformFeeInCheckoutAction:", err);
		return {
			ok: false,
			reason: "mutation_error",
			message: "Impossible d'ajouter les frais de plateforme.",
		};
	}
}
