import { AttributeFilterFragment, FilteringAttributesQueryDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { mapEdgesToItems } from "@/lib/maps";

/**
 * Fetches and transforms product attributes based on origin & destination.
 * It refines departure-station and arrival-station attributes according to provided values.
 */
export async function getTransformedAttributes({
	originSlug,
	destinationSlug,
	channel = "ci",
}: {
	originSlug: string;
	destinationSlug: string;
	channel?: string;
}): Promise<{
	attributes: AttributeFilterFragment[];
}> {
	// ✅ Fetch both attribute values and attributes list in parallel
	const [attributesRes] = await Promise.all([
		executeGraphQL(FilteringAttributesQueryDocument, {
			variables: { channel, filter: { filterableInStorefront: true } },
			revalidate: 60,
		}),
	]);

	// ✅ Map & filter attributes
	let attributes: AttributeFilterFragment[] = mapEdgesToItems(attributesRes.attributes);
	attributes = attributes.filter((attr) => attr.choices?.edges.length);

	// ✅ Refine station attributes based on origin/destination slug
	attributes = attributes.map((attr): AttributeFilterFragment => {
		if (attr.slug === "departure-station") {
			const filteredEdges =
				attr.choices?.edges.filter((edge) => edge.node.slug?.includes(originSlug || "")) ?? [];

			return {
				...attr,
				choices: {
					...attr.choices!,
					edges: filteredEdges,
				},
			};
		}

		if (attr.slug === "arrival-station") {
			const filteredEdges =
				attr.choices?.edges.filter((edge) => edge.node.slug?.includes(destinationSlug || "")) ?? [];

			return {
				...attr,
				choices: {
					...attr.choices!,
					edges: filteredEdges,
				},
			};
		}

		return attr;
	});

	return { attributes };
}
