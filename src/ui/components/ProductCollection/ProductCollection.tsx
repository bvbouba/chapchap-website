"use client";

import React, { useEffect, useState } from "react";
import {
  OrderDirection,
  ProductVariantCollectionQuery,
  ProductVariantSortField,
  ProductVariantWhereInput,
} from "@/gql/graphql";
import { ProductList } from "../ProductList";
import SortingDropdown from "../productList/FilteredProductList/SortingDropdown";
import { UrlSorting } from "../productList/FilteredProductList/sorting";
import { Pagination } from "./Pagination";
import { mapEdgesToItems } from "@/lib/maps";
import { TopPaginationInfo } from "../Pagination/TopPaginationInfo";
import { BottomPagination } from "../Pagination/BottomPagination";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProductVariantCollectionQuery | null>(null);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);

  async function fetchProducts(cursor?: string) {
    try {
      setLoading(true);
      setError(null);

      const updatedWhere:ProductVariantWhereInput = {
        ...where,
        attributes: [
          ...(where?.attributes ?? []),
          { slug: "departure-city", value:{slug:{oneOf:[originSlug]} }},
          { slug: "arrival-city", value:{slug: {oneOf:[destinationSlug]}} },
          { slug: "departure-time", value: { dateTime: {
            gte: `${date}T00:00:00`,
            lte: `${date}T23:59:59`,
            } } },
        ],
      };

      const res = await fetch("/api/product-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          where: updatedWhere,
          sortBy,
          perPage,
          after: cursor,
          channel:"ci"
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = (await res.json()) as ProductVariantCollectionQuery;
      const productVariants = result.productVariants
      setData(result)

      if (cursor && data && productVariants) {
        setData({
          ...result,
          productVariants: {
            ...productVariants,
            edges: [
              ...(data.productVariants?.edges ?? []),
              ...(result.productVariants?.edges ?? []),
            ],
          },
        });
      } else {
        setData(result);
      }

    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les produits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [where, sortBy,originSlug, destinationSlug, date]);

  useEffect(() => {
    if (setCounter) {
      setCounter(data?.productVariants?.totalCount || 0);
    }
  }, [data?.productVariants?.totalCount]);

  const onLoadMore = () => {
    const nextCursor = data?.productVariants?.pageInfo.endCursor || null;
   
    if(nextCursor) {
      setAfterCursor(nextCursor);
      fetchProducts(nextCursor);
    }
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
        {error}
      </div>
    );
  }

  const variants = mapEdgesToItems(data?.productVariants);

  if (!variants.length) {
    return (
      <div className="mx-auto max-w-7xl p-8 text-center text-gray-500">
        Aucun voyage trouvé pour cette recherche.
      </div>
    );
  }

  return (
    <>
     <div className="md:w-3/4 w-full space-y-4">
          <div className="flex justify-between items-center">
          <SortingDropdown
              optionToggle={optionToggle}
              chosen={chosen}
            />
             <TopPaginationInfo
          itemsCount={variants.length}
          totalCount={data?.productVariants?.totalCount || 0}
        />
            </div>
      <ProductList variants={variants} />
      {allowMore && data?.productVariants?.pageInfo?.hasNextPage && (
        <BottomPagination
          onLoadMore={onLoadMore}
          pageInfo={data.productVariants.pageInfo}
        />
      )}
      </div>
     
    </>
  );
}

export default ProductCollection;
