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
	displayUpcomingTrip?: boolean;
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
	chosen,
	displayUpcomingTrip = false,
}: ProductCollectionProps) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<ProductVariantCollectionQuery | null>(null);

	async function fetchProducts(cursor?: string) {
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
			const productVariants = result.productVariants;
			setData(result);

			if (cursor && data && productVariants) {
				setData({
					...result,
					productVariants: {
						...productVariants,
						edges: [...(data.productVariants?.edges ?? []), ...(result.productVariants?.edges ?? [])],
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
	}, [where, sortBy, originSlug, destinationSlug, date]);

	useEffect(() => {
		if (setCounter) {
			setCounter(data?.productVariants?.totalCount || 0);
		}
	}, [data?.productVariants?.totalCount]);

	const onLoadMore = () => {
		const nextCursor = data?.productVariants?.pageInfo.endCursor || null;

		if (nextCursor) {
			fetchProducts(nextCursor);
		}
	};

	if (error) {
		return <div className="mx-auto max-w-7xl p-8 text-center text-red-500">{error}</div>;
	}

	const variants = mapEdgesToItems(data?.productVariants);

	return (
		<div className="relative w-3/4 space-y-4 md:w-3/4">
			{/* 🔄 Overlay loader instead of replacing UI */}
			{loading && (
				<div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
					<div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
				</div>
			)}

			{/* Content remains visible behind loader */}
			{variants.length && !displayUpcomingTrip ? (
				<div className="flex items-center justify-between">
					<SortingDropdown optionToggle={optionToggle} chosen={chosen} />
					<TopPaginationInfo
						itemsCount={variants.length}
						totalCount={data?.productVariants?.totalCount || 0}
					/>
				</div>
			) : (
				<></>
			)}

			{variants.length ? (
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
}

export default ProductCollection;
