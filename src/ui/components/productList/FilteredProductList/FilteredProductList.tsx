"use client";

import { queryTypes, useQueryState } from "next-usequerystate";
import { useEffect, useState } from "react";

import dayjs from "dayjs";
import { ProductCollection } from "../../ProductCollection";
// ✅ Correction: Import nommé
import { SimpleHeroSearch } from "../../HeroSearch/SimpleHeroSearch";
import { UpcomingTripsSection } from "../../trips/UpcomingTripsSection";
import { SectionFilter } from "../../trips/SectionFilter";
import { ProgressHeader } from "../../ProgressHeader";
import { type citiesType } from "../../HeroSearch/HeroSearch";
import {
	getPillsData,
	parseQueryAttributeFilters,
	serializeQueryAttributeFilters,
	type UrlFilter,
} from "./attributes";
import { parseQuerySort, serializeQuerySort, type UrlSorting } from "./sorting";
import { type FilterPill } from "./FilterPills";
import {
	type AssignedAttributeValueFragment,
	type AttributeFilterFragment,
	type OrderDirection,
	type ProductVariantSortField,
	type ProductVariantWhereInput,
} from "@/gql/graphql";
import { useTripSearch } from "@/context/TripSearchContext";

export interface FilteredProductListProps {
	attributeFiltersData: AttributeFilterFragment[];
	collectionIDs?: string[];
	categoryIDs?: string[];
	originData: AssignedAttributeValueFragment | null | undefined;
	destinationData: AssignedAttributeValueFragment | null | undefined;
	busOperator?: string;
	busOperatorName?: string;
	cities: citiesType;
	selectedDate?: string;
}

export const FilteredProductList = ({
	attributeFiltersData,
	originData,
	destinationData,
	busOperator,
	busOperatorName,
	cities,
	selectedDate,
	categoryIDs,
	collectionIDs,
}: FilteredProductListProps) => {
	const [queryFilters, setQueryFilters] = useQueryState("filters", {
		parse: parseQueryAttributeFilters,
		serialize: serializeQueryAttributeFilters,
		defaultValue: [],
	});

	const [, setItemsCounter] = useState(0);

	const [sortByQuery, setSortByQuery] = useQueryState("sortBy", {});

	const sortBy = parseQuerySort(sortByQuery);
	const setSortBy = (value: UrlSorting | undefined | null) => void setSortByQuery(serializeQuerySort(value));

	const [inStockFilter] = useQueryState("inStock", queryTypes.boolean.withDefault(false));

	const [productVariantsWhere, setProductVariantsWhere] = useState<ProductVariantWhereInput>();

	const pills: FilterPill[] = getPillsData(queryFilters, attributeFiltersData);

	const { data, setData } = useTripSearch();

	const today = dayjs();

	useEffect(() => {
		if (originData && destinationData) {
			const todayStr = today.format("YYYY-MM-DD");
			let validatedDate = todayStr;

			if (selectedDate) {
				const dateOnly = selectedDate.split(/[ T]/)[0];
				const parsedDate = dayjs(dateOnly);

				if (parsedDate.isValid() && !parsedDate.isBefore(today, "day")) {
					validatedDate = dateOnly;
				}
			}

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
				date: data?.date ?? validatedDate,
				query: {
					origin: originData.slug ?? "",
					destination: destinationData.slug ?? "",
					date: data?.date ?? validatedDate,
				},
			});
		}
		// ✅ Correction: Ajout des dépendances manquantes
	}, [originData, destinationData, selectedDate, setData, data?.date, data?.tripType, today]);

	useEffect(() => {
		setProductVariantsWhere({
			attributes: queryFilters.filter((filter) => filter.value.slug.oneOf.length),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inStockFilter, JSON.stringify(queryFilters), categoryIDs, collectionIDs]);

	useEffect(() => {
		if (busOperator && !queryFilters.some((f) => f.slug === "bus-operator")) {
			void setQueryFilters(
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

		void setQueryFilters(newFilters.length ? newFilters : null, {
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

		const existingFilter = queryFilters.find((filter) => filter.slug === attributeSlug);
		if (!existingFilter) {
			void setQueryFilters(
				[...queryFilters, { slug: attributeSlug, value: { slug: { oneOf: [choiceSlug] } } }],
				{
					scroll: false,
					shallow: true,
				},
			);
			return;
		}

		existingFilter.value.slug.oneOf = [...existingFilter.value.slug.oneOf, choiceSlug];
		void setQueryFilters(queryFilters, {
			scroll: false,
			shallow: true,
		});
	};

	const clearFilters = async () => {
		// ✅ Correction: await utilisé correctement ici car la fonction est async
		await setQueryFilters(null, {
			scroll: false,
			shallow: true,
		});
		// Note: Si setInStockFilter ne retourne pas de promesse, enlevez le await ou utilisez void
		void setSortBy(null);
	};

	if (!productVariantsWhere || !data) {
		return null;
	}

	const displayUpcomingTrip = !!categoryIDs?.length;

	return (
		<>
			<SimpleHeroSearch data={data} cities={cities} />

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
};
