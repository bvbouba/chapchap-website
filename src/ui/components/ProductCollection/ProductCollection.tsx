"use client";

import React, { useEffect, useState } from "react";
import {
  OrderDirection,
  ProductCollectionQuery,
  ProductFilterInput,
  ProductOrderField,
} from "@/gql/graphql";
import { ProductList } from "../ProductList";
import SortingDropdown from "../productList/FilteredProductList/SortingDropdown";
import { UrlSorting } from "../productList/FilteredProductList/sorting";
import { Pagination } from "./Pagination";

export interface ProductCollectionProps {
  filter?: ProductFilterInput;
  sortBy?: {
    field: ProductOrderField;
    direction?: OrderDirection;
  };
  allowMore?: boolean;
  perPage?: number;
  setCounter?: (value: number) => void;
  originSlug: string;
  destinationSlug: string;
  date: string;
  optionToggle: (field?: ProductOrderField, direction?: OrderDirection) => void;
  chosen: UrlSorting | null;
} 
  


export function ProductCollection({
  filter,
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
  const [data, setData] = useState<ProductCollectionQuery | null>(null);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [variants, setVariants] = useState<any[]>([]);

  async function fetchProducts(cursor?: string) {
    try {
      setLoading(true);
      setError(null);

      const updatedFilter = {
        ...filter,
        attributes: [
          ...(filter?.attributes ?? []),
          { slug: "departure-city", values: [originSlug] },
          { slug: "arrival-city", values: [destinationSlug] },
        ],
      };

      const res = await fetch("/api/product-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filter: updatedFilter,
          sortBy,
          perPage,
          after: cursor,
          date
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = (await res.json()) as ProductCollectionQuery;
      const products = result.products;

      // If fetching more, append new edges
      if (cursor && data && products) {
        setData({
          ...result,
          products: {
            ...products,
            edges: [
              ...(data.products?.edges ?? []),
              ...(result.products?.edges ?? []),
            ],
          },
        });
      } else {
        setData(result);
      }

      
      if (!products || !products.edges.length) {
        setVariants([]);
        setLoading(false);
        return;
      }
      const allVariants = products.edges.flatMap(
        ({ node: product }: any) =>
          product.productVariants?.edges.map(({ node }: any) => node) ?? []
      );
      
      setVariants(allVariants);

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
  }, [filter, sortBy,originSlug, destinationSlug, date]);

  useEffect(() => {
    if (setCounter) {
      setCounter(data?.products?.totalCount || 0);
    }
  }, [data?.products?.totalCount]);

  const onLoadMore = () => {
    const nextCursor = data?.products?.pageInfo.endCursor || null;
   
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
          <div>
          <SortingDropdown
              optionToggle={optionToggle}
              chosen={chosen}
            />
             {allowMore && data?.products?.pageInfo?.hasNextPage && (
        <Pagination
          onLoadMore={onLoadMore}
          pageInfo={data.products.pageInfo}
          itemsCount={data.products.edges.length}
          totalCount={data.products.totalCount || undefined}
        />
      )} 
            </div>
      <ProductList variants={variants} />
      </div>
     
    </>
  );
}

export default ProductCollection;
