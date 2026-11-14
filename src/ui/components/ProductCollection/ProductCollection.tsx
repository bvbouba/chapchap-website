"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ProductList } from "../ProductList";
import { BottomPagination } from "../Pagination/BottomPagination";
import { EllipsisLoader } from "../EllipsisLoader";
import { mapEdgesToItems } from "@/lib/maps";
import {
	type OrderDirection,
	type ProductVariantCollectionQuery,
	type ProductVariantListItemFragment,
	type ProductVariantSortField,
	type ProductVariantWhereInput,
} from "@/gql/graphql";
import {
	getDepartureHour,
	matchesDeparturePeriods,
	type ClientSortMode,
	type DeparturePeriod,
	type UrlSorting,
} from "../productList/FilteredProductList/sorting";
import { type OperatorCardMetaMap } from "@/lib/loadOperatorLogoMap";

export interface ProductCollectionProps {
	where?: ProductVariantWhereInput;
	sortBy?: {
		field: ProductVariantSortField;
		direction?: OrderDirection;
	};
	sortMode?: ClientSortMode;
	allowMore?: boolean;
	perPage?: number;
	setCounter?: (value: number) => void;
	originSlug: string;
	destinationSlug: string;
	date: string;
	optionToggle?: (field?: ProductVariantSortField, direction?: OrderDirection) => void;
	chosen?: UrlSorting | null;
	displayUpcomingTrip?: boolean;
	periods?: DeparturePeriod[];
	pillsSlot?: React.ReactNode;
	toolbarSlot?: React.ReactNode;
	operatorMeta?: OperatorCardMetaMap;
}

function getAttrValue(variant: ProductVariantListItemFragment, slug: string): string | undefined {
	const found = variant.attributes?.find((attr) => attr.attribute?.slug === slug);
	return found?.values?.[0]?.name ?? found?.values?.[0]?.value ?? undefined;
}

function applyClientTransforms(
	variants: ProductVariantListItemFragment[],
	periods: DeparturePeriod[],
	sortMode: ClientSortMode,
): ProductVariantListItemFragment[] {
	let next = variants;
	if (periods.length) {
		next = next.filter((v) =>
			matchesDeparturePeriods(getAttrValue(v, "departure-time"), periods),
		);
	}
	if (sortMode === "earliest") {
		next = [...next].sort((a, b) => {
			const ha = getDepartureHour(getAttrValue(a, "departure-time"));
			const hb = getDepartureHour(getAttrValue(b, "departure-time"));
			if (ha == null && hb == null) return 0;
			if (ha == null) return 1;
			if (hb == null) return -1;
			return ha - hb;
		});
	}
	return next;
}

export const ProductCollection = ({
	where,
	sortBy,
	sortMode = "chaplist",
	setCounter,
	allowMore = true,
	perPage = 10,
	originSlug,
	destinationSlug,
	date,
	displayUpcomingTrip = false,
	periods = [],
	pillsSlot,
	toolbarSlot,
	operatorMeta = {},
}: ProductCollectionProps) => {
	const params = useParams<{ channel: string }>();
	const channel = Array.isArray(params.channel) ? params.channel[0] : params.channel;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<ProductVariantCollectionQuery | null>(null);

	const fetchProducts = useCallback(
		async (cursor?: string) => {
			try {
				setLoading(true);
				setError(null);

				if (!channel) {
					throw new Error("Missing channel");
				}

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
						sortBy: sortMode === "cheapest" ? sortBy : undefined,
						perPage,
						after: cursor,
						channel,
					}),
				});

				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const result = (await res.json()) as ProductVariantCollectionQuery;

				setData((prevData) => {
					const productVariants = result.productVariants;
					if (cursor && prevData && productVariants) {
						return {
							...result,
							productVariants: {
								...productVariants,
								edges: [
									...(prevData.productVariants?.edges ?? []),
									...(result.productVariants?.edges ?? []),
								],
							},
						};
					}
					return result;
				});
			} catch (err) {
				console.error("Erreur:", err);
				setError("Impossible de charger les trajets.");
			} finally {
				setLoading(false);
			}
		},
		[where, sortBy, sortMode, originSlug, destinationSlug, date, perPage, channel],
	);

	useEffect(() => {
		void fetchProducts();
	}, [fetchProducts]);

	const rawVariants = mapEdgesToItems(data?.productVariants);
	const variants = useMemo(
		() => applyClientTransforms(rawVariants, periods, sortMode),
		[rawVariants, periods, sortMode],
	);

	useEffect(() => {
		if (setCounter) {
			// Prefer filtered count when period filters are active.
			const total =
				periods.length || sortMode === "earliest"
					? variants.length
					: data?.productVariants?.totalCount || variants.length;
			setCounter(total);
		}
	}, [data?.productVariants?.totalCount, variants.length, periods.length, sortMode, setCounter]);

	const onLoadMore = () => {
		const nextCursor = data?.productVariants?.pageInfo.endCursor || null;
		if (nextCursor) {
			void fetchProducts(nextCursor);
		}
	};

	if (error) {
		return <div className="w-full p-8 text-center text-red-500">{error}</div>;
	}

	return (
		<div className="relative min-w-0 flex-1 space-y-4">
			{pillsSlot}
			{toolbarSlot}

			{loading ? (
				<div className="flex items-start justify-center rounded-2xl border border-[#E8E9EC] bg-white px-4 py-8">
					<EllipsisLoader label="Préparation de vos trajets…" color="#A6C65A" />
				</div>
			) : null}

			{!loading && !displayUpcomingTrip && variants.length > 0 ? (
				<p className="text-sm text-[#606060]">
					Affichage de <span className="font-semibold text-[#111111]">{variants.length}</span>
					{data?.productVariants?.totalCount && !periods.length ? (
						<>
							{" "}
							sur{" "}
							<span className="font-semibold text-[#111111]">
								{data.productVariants.totalCount}
							</span>
						</>
					) : null}{" "}
					trajet{variants.length > 1 ? "s" : ""}
				</p>
			) : null}

			{!loading && variants.length > 0 ? (
				<ProductList variants={variants} operatorMeta={operatorMeta} />
			) : null}

			{!loading && variants.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-[#E2E3E7] bg-[#FAFAFA] p-10 text-center text-[#606060]">
					Aucun trajet trouvé pour cette sélection.
				</div>
			) : null}

			{allowMore && data?.productVariants?.pageInfo?.hasNextPage && !loading && (
				<BottomPagination onLoadMore={onLoadMore} pageInfo={data.productVariants.pageInfo} />
			)}
		</div>
	);
};
