import { getAllCities } from "@/actions";
import { GetAttributeValueByIdDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
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

// ✅ Define SearchParams to capture the date
interface PageSearchParams {
	date?: string;
}

export default async function Page(props: {
	params: Promise<PageParams>;
	searchParams: Promise<PageSearchParams>; // ✅ Extract searchParams
}) {
	const { origin, destination } = await props.params;
	const { date } = await props.searchParams; // ✅ Extract date

	const cities = await getAllCities();

	const [originRes, destinationRes] = await Promise.all([
		executeGraphQL(GetAttributeValueByIdDocument, {
			variables: { id: origin },
			revalidate: 60,
		}),
		executeGraphQL(GetAttributeValueByIdDocument, {
			variables: { id: destination },
			revalidate: 60,
		}),
	]);

	const originData = originRes.attributeValue;
	const destinationData = destinationRes.attributeValue;

	const { attributes } = await getTransformedAttributes({
		originSlug: originData?.slug || "",
		destinationSlug: destinationData?.slug || "",
		channel: "ci",
	});

	return (
		<FilteredProductList
			attributeFiltersData={attributes}
			originData={originData}
			destinationData={destinationData}
			cities={cities}
			selectedDate={date} // ✅ Pass the date here
		/>
	);
}
