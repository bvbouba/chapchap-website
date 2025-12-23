"use client";

import { queryTypes, useQueryState } from "next-usequerystate";
import { useEffect, useState } from "react";

import {
	getPillsData,
	parseQueryAttributeFilters,
	serializeQueryAttributeFilters,
	UrlFilter,
} from "./attributes";
import { parseQuerySort, serializeQuerySort, UrlSorting } from "./sorting";
import { FilterPill } from "./FilterPills";
import {
	AssignedAttributeValueFragment,
	AttributeFilterFragment,
	OrderDirection,
	ProductVariantSortField,
	ProductVariantWhereInput,
} from "@/gql/graphql";
import { ProductCollection } from "../../ProductCollection";
import { useTripSearch } from "@/context/TripSearchContext";
import SimpleHeroSearch from "../../HeroSearch/SimpleHeroSearch";
import UpcomingTripsSection from "../../trips/UpcomingTripsSection";
import SectionFilter from "../../trips/SectionFilter";
import dayjs from "dayjs";
import ProgressHeader from "../../ProgressHeader";
import { citiesType } from "../../HeroSearch/HeroSearch";

export interface FilteredProductListProps {
	attributeFiltersData: AttributeFilterFragment[];
	collectionIDs?: string[];
	categoryIDs?: string[];
	originData: AssignedAttributeValueFragment | null | undefined;
	destinationData: AssignedAttributeValueFragment | null | undefined;
	busOperator?: string;
	busOperatorName?: string;
	cities : citiesType
}

export interface Filters {
	sortBy: string;
	attributes: Record<string, Array<string>>;
}

export interface ListFilters {
	attributes: {};
}

export function FilteredProductList({
	attributeFiltersData,
	collectionIDs,
	categoryIDs,
	originData,
	destinationData,
	busOperator,
	busOperatorName,
	cities
}: FilteredProductListProps) {
	const [queryFilters, setQueryFilters] = useQueryState("filters", {
		parse: parseQueryAttributeFilters,
		serialize: serializeQueryAttributeFilters,
		defaultValue: [],
	});

	const [, setItemsCounter] = useState(0);

	const [sortByQuery, setSortByQuery] = useQueryState("sortBy", {});

	const sortBy = parseQuerySort(sortByQuery);
	const setSortBy = (value: UrlSorting | undefined | null) => setSortByQuery(serializeQuerySort(value));

	const [inStockFilter, setInStockFilter] = useQueryState("inStock", queryTypes.boolean.withDefault(false));

	const [productVariantsWhere, setProductVariantsWhere] = useState<ProductVariantWhereInput>();

	const pills: FilterPill[] = getPillsData(queryFilters, attributeFiltersData);

	const { data, setData } = useTripSearch();

	const today = dayjs();

	// ✅ Initialize context when data arrives
	useEffect(() => {
		if (originData && destinationData) {
			setData({
				tripType: data?.tripType ?? "oneway",
				origin: {
					id: originData.id ?? "",
					name: originData.name ?? "",
					slug: originData.slug ?? "",
				},
				destination: {
					id: destinationData.id ?? "",
					name: destinationData.name ?? "",
					slug: destinationData.slug ?? "",
				},
				date: data?.date ?? today.format("YYYY-MM-DD"),
				query: {
					origin: originData.slug ?? "",
					destination: destinationData.slug ?? "",
					date: data?.date ?? today.format("YYYY-MM-DD"),
				},
			});
		}
	}, [originData, destinationData, setData]);

	useEffect(() => {
		setProductVariantsWhere({
			attributes: queryFilters.filter((filter) => filter.value.slug.oneOf.length),
			// ...(categoryIDs?.length && { categories: categoryIDs }),
			// ...(collectionIDs?.length && { collections: collectionIDs }),
		});
		// Eslint does not recognize stringified queryFilters, so we have to ignore it
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inStockFilter, JSON.stringify(queryFilters), categoryIDs, collectionIDs]);

	useEffect(() => {
		if (busOperator && !queryFilters.some((f) => f.slug === "bus-operator")) {
			setQueryFilters(
				[...queryFilters, { slug: "bus-operator", value: { slug: { oneOf: [busOperator] } } }],
				{ scroll: false, shallow: true },
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [busOperator]);

	const removeAttributeFilter = (attributeSlug: string, choiceSlug: string) => {
		const newFilters = queryFilters.reduce((result: UrlFilter[], filter: UrlFilter) => {
			if (filter.slug !== attributeSlug) {
				return [...result, filter];
			}
			const newFilterValues = filter.value.slug.oneOf.filter((value) => value !== choiceSlug);
			if (newFilterValues?.length) {
				return [...result, { ...filter, value: { slug: { oneOf: newFilterValues } } }];
			}
			return result;
		}, []);

		setQueryFilters(newFilters.length ? newFilters : null, {
			scroll: false,
			shallow: true,
		});
	};

	const addAttributeFilter = (attributeSlug: string, choiceSlug: string) => {
		const isFilterAlreadyApplied = !!pills.find(
			(pill) => pill.attributeSlug === attributeSlug && pill.choiceSlug === choiceSlug,
		);
		if (isFilterAlreadyApplied) {
			removeAttributeFilter(attributeSlug, choiceSlug);
			return;
		}

		// if attribute was not used before, add it
		const existingFilter = queryFilters.find((filter) => filter.slug === attributeSlug);
		if (!existingFilter) {
			setQueryFilters([...queryFilters, { slug: attributeSlug, value: { slug: { oneOf: [choiceSlug] } } }], {
				scroll: false,
				shallow: true,
			});
			return;
		}

		// if its already here, modify values list
		existingFilter.value.slug.oneOf = [...existingFilter.value.slug.oneOf, choiceSlug];
		setQueryFilters(queryFilters, {
			scroll: false,
			shallow: true,
		});
	};

	const clearFilters = async () => {
		// await required when multiple query changes are applied at once
		await setQueryFilters(null, {
			scroll: false,
			shallow: true,
		});
		await setInStockFilter(null, {
			scroll: false,
			shallow: true,
		});
	};

	if (!productVariantsWhere) {
		return null;
	}

	if (!data) return null;

	const displayUpcomingTrip = !!categoryIDs?.length;
	return (
		<>
			<SimpleHeroSearch data={data} cities={cities}/>

			{displayUpcomingTrip ? (
				<UpcomingTripsSection
					originName={data.origin.name}
					destinationName={data.destination.name}
					initialDate={data.date}
					busOperatorName={busOperatorName}
				/>
			) : (
				<ProgressHeader destinationName={data.destination.name} date={data.date} />
			)}
			<div className="mt-4">
				<section
					className={`mx-auto flex w-full max-w-6xl gap-6 px-8 py-8 
    ${!displayUpcomingTrip ? "flex-col md:flex-row" : "justify-center"}`}
				>
					{!displayUpcomingTrip && (
						<SectionFilter
							pills={pills}
							clearFilters={clearFilters}
							attributeFiltersData={attributeFiltersData}
							addAttributeFilter={addAttributeFilter}
						/>
					)}

					<ProductCollection
						where={productVariantsWhere}
						sortBy={sortBy || undefined}
						setCounter={setItemsCounter}
						perPage={2}
						originSlug={data.query?.origin ?? "abidjan"}
						destinationSlug={data.query?.destination ?? "yamoussoukro"}
						date={data.query?.date ?? ""}
						optionToggle={(field?: ProductVariantSortField, direction?: OrderDirection) => {
							setSortBy(field && direction ? { field, direction } : null);
						}}
						chosen={sortBy}
						displayUpcomingTrip={displayUpcomingTrip}
					/>
				</section>
			</div>
		</>
	);
}

export default FilteredProductList;
