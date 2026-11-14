import { getAllCities } from "@/actions";
import { GetAttributeValueByIdDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { loadOperatorCardMetaMap } from "@/lib/loadOperatorLogoMap";
import { getTransformedAttributes } from "@/lib/transformAttributes";
import { FilteredProductList } from "@/ui/components/productList/FilteredProductList";

export const metadata = {
	title: "Résultats de recherche | ChapChap Tickets",
};

interface PageParams {
	channel: string;
	destination: string;
	origin: string;
}

interface PageSearchParams {
	date?: string;
}

export default async function Page(props: {
	params: Promise<PageParams>;
	searchParams: Promise<PageSearchParams>;
}) {
	const { origin, destination, channel } = await props.params;
	const { date } = await props.searchParams;

	const cities = await getAllCities();

	const [originRes, destinationRes, operatorMeta] = await Promise.all([
		executeGraphQL(GetAttributeValueByIdDocument, {
			variables: { id: origin },
			revalidate: 60,
		}),
		executeGraphQL(GetAttributeValueByIdDocument, {
			variables: { id: destination },
			revalidate: 60,
		}),
		loadOperatorCardMetaMap(),
	]);

	const originData = originRes.attributeValue;
	const destinationData = destinationRes.attributeValue;

	const { attributes } = await getTransformedAttributes({
		originSlug: originData?.slug || "",
		destinationSlug: destinationData?.slug || "",
		channel,
	});

	return (
		<FilteredProductList
			attributeFiltersData={attributes}
			originData={originData}
			destinationData={destinationData}
			cities={cities}
			selectedDate={date}
			operatorMeta={operatorMeta}
		/>
	);
}
