import {
	AttributeFilterFragment,
	FilteringAttributesQueryDocument,
	GetAttributeValueByIdDocument,
  } from "@/gql/graphql";
  import { executeGraphQL } from "@/lib/graphql";
  import { mapEdgesToItems } from "@/lib/maps";
  import FilteredProductList from "@/ui/components/productList/FilteredProductList";
  
  export const metadata = {
	title: "Résumé du voyage | Votre agence de voyage en ligne",
	description:
	  "Consultez le résumé de votre trajet et procédez au paiement. Réservez facilement vos billets de bus, de train ou d’avion avec notre plateforme sécurisée.",
  };
  
  interface PageParams {
	channel: string;
	destination: string;
	date: string;
	origin: string;
  }
  
  export default async function Page(props: { params: Promise<PageParams> }) {
	const { origin, destination, date } = await props.params;
  
	// ✅ Fetch both origin & destination in parallel
	const [originRes, destinationRes, attributesRes] = await Promise.all([
	  executeGraphQL(GetAttributeValueByIdDocument, {
		variables: { id: origin },
		revalidate: 60,
	  }),
	  executeGraphQL(GetAttributeValueByIdDocument, {
		variables: { id: destination },
		revalidate: 60,
	  }),
	  executeGraphQL(FilteringAttributesQueryDocument, {
		variables: { channel: "ci", filter: {} },
		revalidate: 60,
	  }),
	]);
  
	const originData = originRes.attributeValue;
	const destinationData = destinationRes.attributeValue;
  
	// ✅ Map attributes and filter out those with no choices
	let attributes: AttributeFilterFragment[] = mapEdgesToItems(attributesRes.attributes);
	attributes = attributes.filter((attribute) => attribute.choices?.edges.length);
  
	// ✅ Refine departure-station and arrival-station based on origin/destination slugs
	attributes = attributes.map((attr): AttributeFilterFragment => {
		if (attr.slug === "departure-station") {
		  const filteredEdges = attr.choices?.edges.filter((edge) =>
			edge.node.slug?.includes(originData?.slug || "")
		  ) ?? [];
	  
		  return {
			...attr,
			choices: {
			  ...attr.choices!,
			  edges: filteredEdges,
			},
		  };
		}
	  
		if (attr.slug === "arrival-station") {
		  const filteredEdges = attr.choices?.edges.filter((edge) =>
			edge.node.slug?.includes(destinationData?.slug || "")
		  ) ?? [];
	  
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
	  
  
	return (
	  <FilteredProductList
		attributeFiltersData={attributes}
		originData={originData}
		destinationData={destinationData}
		date={date}
	  />
	);
  }
  