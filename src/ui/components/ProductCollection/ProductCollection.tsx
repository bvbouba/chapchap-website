"use client";

import React, { useEffect, useState, useCallback } from "react"; // ✅ Ajout de useCallback
import { ProductList } from "../ProductList";
import { SortingDropdown } from "../productList/FilteredProductList/SortingDropdown";
import { type UrlSorting } from "../productList/FilteredProductList/sorting";
import { TopPaginationInfo } from "../Pagination/TopPaginationInfo";
import { BottomPagination } from "../Pagination/BottomPagination";
import { mapEdgesToItems } from "@/lib/maps";
import {
	type OrderDirection,
	type ProductVariantCollectionQuery,
	type ProductVariantSortField,
	type ProductVariantWhereInput,
} from "@/gql/graphql";

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
	displayUpcomingTrip?: boolean;
}

export const ProductCollection = ({
	where,
	sortBy,
	setCounter,
	allowMore = true,
	perPage = 2,
	originSlug,
	destinationSlug,
	date,
	optionToggle,
	chosen,
	displayUpcomingTrip = false,
}: ProductCollectionProps) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<ProductVariantCollectionQuery | null>(null);

	// ✅ Correction: fetchProducts est maintenant enveloppée dans useCallback
	const fetchProducts = useCallback(
		async (cursor?: string) => {
			try {
				setLoading(true);
				setError(null);

				const updatedWhere: ProductVariantWhereInput = {
					...where,
					attributes: [
						...(where?.attributes ?? []),
						{ slug: "departure-city", value: { slug: { oneOf: [originSlug] } } },
						{ slug: "arrival-city", value: { slug: { oneOf: [destinationSlug] } } },
						{
							slug: "departure-time",
							value: {
								dateTime: {
									gte: `${date}T00:00:00`,
									lte: `${date}T23:59:59`,
								},
							},
						},
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
						channel: "ci",
					}),
				});

				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const result = (await res.json()) as ProductVariantCollectionQuery;

				// On utilise la version fonctionnelle de setData pour éviter de dépendre de 'data' dans useCallback
				setData((prevData) => {
					const productVariants = result.productVariants;
					if (cursor && prevData && productVariants) {
						return {
							...result,
							productVariants: {
								...productVariants,
								edges: [...(prevData.productVariants?.edges ?? []), ...(result.productVariants?.edges ?? [])],
							},
						};
					}
					return result;
				});
			} catch (err) {
				console.error("Erreur:", err);
				setError("Impossible de charger les produits.");
			} finally {
				setLoading(false);
			}
		},
		[where, sortBy, originSlug, destinationSlug, date, perPage],
	); // Dépendances de useCallback

	useEffect(() => {
		void fetchProducts();
	}, [fetchProducts]); // ✅ Maintenant fetchProducts peut être inclus ici en toute sécurité

	useEffect(() => {
		if (setCounter) {
			setCounter(data?.productVariants?.totalCount || 0);
		}
	}, [data?.productVariants?.totalCount, setCounter]);

	const onLoadMore = () => {
		const nextCursor = data?.productVariants?.pageInfo.endCursor || null;
		if (nextCursor) {
			void fetchProducts(nextCursor);
		}
	};

	if (error) {
		return <div className="mx-auto max-w-7xl p-8 text-center text-red-500">{error}</div>;
	}

	const variants = mapEdgesToItems(data?.productVariants);

	return (
		<div className="relative w-3/4 space-y-4 md:w-3/4">
			{loading && (
				<div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
					<div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
				</div>
			)}

			{variants.length > 0 && !displayUpcomingTrip ? (
				<div className="flex items-center justify-between">
					<SortingDropdown optionToggle={optionToggle} chosen={chosen} />
					<TopPaginationInfo
						itemsCount={variants.length}
						totalCount={data?.productVariants?.totalCount || 0}
					/>
				</div>
			) : null}

			{variants.length > 0 ? (
				<ProductList variants={variants} />
			) : (
				!loading && (
					<div className="p-8 text-center text-gray-500">Aucun trajet trouvé pour cette destination.</div>
				)
			)}

			{allowMore && data?.productVariants?.pageInfo?.hasNextPage && (
				<BottomPagination onLoadMore={onLoadMore} pageInfo={data.productVariants.pageInfo} />
			)}
		</div>
	);
};
