"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  OrderDirection,
  ProductVariantSortField,
  ProductVariantWhereInput,
} from "@/gql/graphql";
import { ProductList } from "../ProductList";
import SortingDropdown from "../productList/FilteredProductList/SortingDropdown";
import { UrlSorting } from "../productList/FilteredProductList/sorting";
import { Pagination } from "./Pagination";
import { mapEdgesToItems } from "@/lib/maps";
import { ProductVariantCollectionQueryVariables } from "../graphql";
import { useProductVariantCollection } from "@/hooks/useProductVariantCollection";
import { BottomPagination } from "../Pagination/BottomPagination";
import { TopPaginationInfo } from "../Pagination/TopPaginationInfo";

export interface ProductCollectionProps {
  where?: ProductVariantWhereInput;
  sortBy?: {
    field: ProductVariantSortField;
    direction?: OrderDirection;
  };
  allowMore?: boolean;
  perPage?: number;
  setCounter?: (value: number) => void;
  originSlug: string;
  destinationSlug: string;
  date: string;
  optionToggle: (field?: ProductVariantSortField, direction?: OrderDirection) => void;
  chosen: UrlSorting | null;
} 
  


export function ProductCollection({
  where,
  sortBy,
  setCounter,
  allowMore = true,
  perPage = 2,
  originSlug,
  destinationSlug,
  date,
  optionToggle,
  chosen
}: ProductCollectionProps) {
  const [after, setAfter] = useState<string | null>(null);


  const variables = useMemo<ProductVariantCollectionQueryVariables>(() => ({
    where: {
      ...where,
      attributes: [
        ...(where?.attributes ?? []),
        { slug: "departure-city", value: { slug: { oneOf: [originSlug] } } },
        { slug: "arrival-city", value: { slug: { oneOf: [destinationSlug] } } },
        { slug: "departure-time", value: { dateTime: {
          gte: `${date}T00:00:00`,
          lte: `${date}T23:59:59`,
        } } },
      ],
    },
    first: perPage,
    channel: "ci",
    after,
    ...(sortBy?.field && sortBy?.direction && {
      sortBy: { field: sortBy.field, direction: sortBy.direction },
    }),
  }), [where, sortBy, originSlug, destinationSlug, date, after, perPage]);

  
  const {productVariants,loading,refetch,error} = useProductVariantCollection({variables})
    
    useEffect(() => {
      if (setCounter) {
        setCounter(productVariants?.totalCount || 0);
      }
    }, [setCounter, productVariants?.totalCount]);
  
    const onLoadMore = () => {
      if (!productVariants?.pageInfo.endCursor) return;
      setAfter(productVariants.pageInfo.endCursor);
      refetch({ requestPolicy: "network-only" });
    };


  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-[#97D700] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-8 text-center text-red-500">
        {error.message}
      </div>
    );
  }

  const variants = mapEdgesToItems(productVariants);

  if (!variants.length) {
    return (
      <div className="mx-auto max-w-7xl p-8 text-center text-gray-500">
        Aucun voyage trouvé pour cette recherche.
      </div>
    );
  }
  
  return (
    <div className="md:w-3/4 w-full space-y-4">
      <div className="flex justify-between items-center">
        <SortingDropdown optionToggle={optionToggle} chosen={chosen} />
        <TopPaginationInfo
          itemsCount={variants.length}
          totalCount={productVariants?.totalCount || 0}
        />
      </div>

      <ProductList variants={variants} />

      {allowMore && productVariants?.pageInfo?.hasNextPage && (
        <BottomPagination
          onLoadMore={onLoadMore}
          pageInfo={productVariants.pageInfo}
        />
      )}
    </div>
  );
}

export default ProductCollection;
