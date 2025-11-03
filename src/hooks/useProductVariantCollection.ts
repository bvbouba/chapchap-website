import { useMemo } from "react";

import { ProductVariantCollectionQueryVariables, useProductVariantCollectionQuery } from "@/ui/components/graphql";

export const useProductVariantCollection = ({ variables }: { variables: ProductVariantCollectionQueryVariables }) => {
	const [{ data, fetching, stale, error }, refetch] = useProductVariantCollectionQuery({
	  variables,
	  requestPolicy: "network-only",
	});
	return useMemo(
	  () => ({
		productVariants: data?.productVariants,
		loading: fetching || stale,
		refetch,
		error,
	  }),
	  [data?.productVariants, fetching, stale, error, refetch]
	);
  };