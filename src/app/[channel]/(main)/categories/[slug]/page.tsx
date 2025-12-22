import { notFound } from "next/navigation";
import { type ResolvingMetadata, type Metadata } from "next";
import { CategoryBySlugDocument, GetAttributeValueBySlugDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { getTransformedAttributes } from "@/lib/transformAttributes";
import FilteredProductList from "@/ui/components/productList/FilteredProductList";

export const generateMetadata = async (
  props: { params: Promise<{ slug: string; channel: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const params = await props.params;
  const { category } = await executeGraphQL(CategoryBySlugDocument, {
    variables: { slug: params.slug, channel: params.channel },
    revalidate: 60,
  });

  return {
    title: `${category?.name || (await parent).title?.absolute}`,
    description: category?.name,
  };
};

export default async function Page(props: { params: Promise<{ slug: string; channel: string }> }) {
  const params = await props.params;
  const { category } = await executeGraphQL(CategoryBySlugDocument, {
    variables: { slug: params.slug, channel: params.channel },
    revalidate: 60,
  });

  if (!category) {
    notFound();
  }

  const metadata = category.metadata || [];
  const origin = metadata.find((m) => m.key === "origin")?.value;
  const destination = metadata.find((m) => m.key === "destination")?.value;
  const busOperator = metadata.find((m) => m.key === "bus-operator")?.value;
  const originSlug = origin || "abidjan"
  const destinationSlug = destination || "yamoussoukro"

  // ✅ Fetch both origin & destination in parallel
	const [originRes, destinationRes ] = await Promise.all([
	  executeGraphQL(GetAttributeValueBySlugDocument, {
		variables: { slug: originSlug},
		revalidate: 60,
	  }),
	  executeGraphQL(GetAttributeValueBySlugDocument, {
		variables: { slug: destinationSlug},
		revalidate: 60,
	  })
	]);
  
	const originData = originRes.attributeValue;
	const destinationData = destinationRes.attributeValue;

  const { attributes } = await getTransformedAttributes({
    originSlug,
    destinationSlug,
    channel: "ci",
  });
  
  return (
    <FilteredProductList
      attributeFiltersData={attributes}
      originData={originData}
      destinationData={destinationData}
      busOperator={busOperator}
      categoryIDs={[category.id]}
      busOperatorName={busOperator}
    />
  );
}