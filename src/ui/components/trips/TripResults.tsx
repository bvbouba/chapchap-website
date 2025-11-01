"use client";

import { useEffect, useState } from "react";
import { ProductList } from "../ProductList";
import { ProductListByAttributesQuery } from "@/gql/graphql";

interface TripResultsProps {
  originSlug: string;
  destinationSlug: string;
  date: string;
}

export default function TripResults({
  originSlug,
  destinationSlug,
  date,
}: TripResultsProps) {
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/products-by-attributes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ originSlug, destinationSlug, date }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = (await response.json()) as ProductListByAttributesQuery;
        const products = result.products;

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
      } catch (err: any) {
        console.error("Failed to fetch:", err);
        setError("Une erreur s’est produite lors du chargement des résultats.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [originSlug, destinationSlug, date]);

  if (loading) {
    return (
      <section className="flex justify-center items-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-[#97D700] rounded-full animate-spin"></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl p-8 text-center text-red-500">
        {error}
      </section>
    );
  }

  if (!variants.length) {
    return (
      <section className="mx-auto max-w-7xl p-8 text-center text-gray-500">
        Aucun voyage trouvé pour cette recherche.
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl p-8 pb-16">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Résultats de recherche ({variants.length})
      </h2>
      <ProductList variants={variants} />
    </section>
  );
}
