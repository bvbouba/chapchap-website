import { getAllCities } from "@/actions";
import {
	GetAttributeValueByIdDocument,
  } from "@/gql/graphql";
  import { executeGraphQL } from "@/lib/graphql";
import { getTransformedAttributes } from "@/lib/transformAttributes";
  import FilteredProductList from "@/ui/components/productList/FilteredProductList";
  
  export const metadata = {
	title: "Résumé du voyage | Votre agence de voyage en ligne",
	description:
	  "Consultez le résumé de votre trajet et procédez au paiement. Réservez facilement vos billets de bus, de train ou d’avion avec notre plateforme sécurisée.",
  };
  
  interface PageParams {
	channel: string;
	destination: string;
	origin: string;
  }
  
  export default async function Page(props: { params: Promise<PageParams> }) {
	const { origin, destination } = await props.params;
    const cities = await getAllCities();
	
	// ✅ Fetch both origin & destination in parallel
	const [originRes, destinationRes ] = await Promise.all([
	  executeGraphQL(GetAttributeValueByIdDocument, {
		variables: { id: origin },
		revalidate: 60,
	  }),
	  executeGraphQL(GetAttributeValueByIdDocument, {
		variables: { id: destination },
		revalidate: 60,
	  })
	]);
  
	const originData = originRes.attributeValue;
	const destinationData = destinationRes.attributeValue;
  
	const { attributes} = await getTransformedAttributes({
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
	  />
	);
  }
  