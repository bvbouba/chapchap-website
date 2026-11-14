"use client";

import { queryTypes, useQueryState } from "next-usequerystate";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import dayjs from "dayjs";
import { ProductCollection } from "../../ProductCollection";
import { SimpleHeroSearch } from "../../HeroSearch/SimpleHeroSearch";
import { UpcomingTripsSection } from "../../trips/UpcomingTripsSection";
import { ResultsDateTabs } from "../../trips/ResultsDateTabs";
import { SectionFilter } from "../../trips/SectionFilter";
import { TripsFilterModal } from "../../trips/TripsFilterModal";
import FilterPills from "./FilterPills";
import { type citiesType } from "../../HeroSearch/HeroSearch";
import {
	getPillsData,
	parseQueryAttributeFilters,
	serializeQueryAttributeFilters,
	type UrlFilter,
} from "./attributes";
import {
	getClientSortMode,
	parseDeparturePeriods,
	parseQuerySort,
	serializeDeparturePeriods,
	serializeQuerySort,
	type ClientSortMode,
	type DeparturePeriod,
} from "./sorting";
import {
	type AssignedAttributeValueFragment,
	type AttributeFilterFragment,
	OrderDirection,
	ProductVariantSortField,
	type ProductVariantWhereInput,
} from "@/gql/graphql";
import { useTripSearch } from "@/context/TripSearchContext";
import { type OperatorCardMetaMap } from "@/lib/loadOperatorLogoMap";

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
	operatorMeta?: OperatorCardMetaMap;
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
	operatorMeta = {},
}: FilteredProductListProps) => {
	const [queryFilters, setQueryFilters] = useQueryState("filters", {
		parse: parseQueryAttributeFilters,
		serialize: serializeQueryAttributeFilters,
		defaultValue: [],
	});

	const [itemsCounter, setItemsCounter] = useState(0);
	const [filterOpen, setFilterOpen] = useState(false);

	const [sortByQuery, setSortByQuery] = useQueryState("sortBy", {});
	const sortBy = parseQuerySort(sortByQuery);
	const sortMode = getClientSortMode(sortBy, sortByQuery);

	const [periodsQuery, setPeriodsQuery] = useQueryState("periods", {});
	const periods = parseDeparturePeriods(periodsQuery);

	const [inStockFilter] = useQueryState("inStock", queryTypes.boolean.withDefault(false));
	const [productVariantsWhere, setProductVariantsWhere] = useState<ProductVariantWhereInput>();
	const pills = getPillsData(queryFilters, attributeFiltersData);
	const { data, setData } = useTripSearch();
	const todayStr = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

	const setSortMode = (mode: ClientSortMode) => {
		if (mode === "earliest") {
			void setSortByQuery("EARLIEST", { scroll: false, shallow: true });
			return;
		}
		if (mode === "cheapest") {
			void setSortByQuery(
				serializeQuerySort({
					field: ProductVariantSortField.Price,
					direction: OrderDirection.Asc,
				}),
				{ scroll: false, shallow: true },
			);
			return;
		}
		void setSortByQuery(null, { scroll: false, shallow: true });
	};

	const togglePeriod = (period: DeparturePeriod) => {
		const next = periods.includes(period)
			? periods.filter((p) => p !== period)
			: [...periods, period];
		void setPeriodsQuery(serializeDeparturePeriods(next), { scroll: false, shallow: true });
	};

	useEffect(() => {
		if (!originData || !destinationData) return;

		let validatedDate = todayStr;
		if (selectedDate) {
			const dateOnly = selectedDate.split(/[ T]/)[0];
			const parsedDate = dayjs(dateOnly);
			if (parsedDate.isValid() && !parsedDate.isBefore(dayjs(todayStr), "day")) {
				validatedDate = dateOnly;
			}
		}

		const nextOrigin = {
			id: originData.id ?? "",
			name: originData.name ?? "",
			slug: originData.slug ?? "",
		};
		const nextDestination = {
			id: destinationData.id ?? "",
			name: destinationData.name ?? "",
			slug: destinationData.slug ?? "",
		};

		const routeChanged =
			data?.origin.id !== nextOrigin.id || data?.destination.id !== nextDestination.id;
		const dateMissing = !data?.date;
		const urlDateDiffers = Boolean(selectedDate) && data?.date !== validatedDate && routeChanged;

		if (!data || routeChanged || dateMissing || urlDateDiffers) {
			setData({
				tripType: data?.tripType ?? "oneway",
				origin: nextOrigin,
				destination: nextDestination,
				date: routeChanged || dateMissing ? validatedDate : (data?.date ?? validatedDate),
				query: {
					origin: nextOrigin.slug,
					destination: nextDestination.slug,
					date: routeChanged || dateMissing ? validatedDate : (data?.date ?? validatedDate),
				},
			});
		}
	}, [originData, destinationData, selectedDate, setData, todayStr, data]);

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
				{ scroll: false, shallow: true },
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
		await setQueryFilters(null, { scroll: false, shallow: true });
		await setPeriodsQuery(null, { scroll: false, shallow: true });
		void setSortByQuery(null, { scroll: false, shallow: true });
	};

	if (!productVariantsWhere || !data) {
		return null;
	}

	const displayUpcomingTrip = !!categoryIDs?.length;
	const activeFilterCount = pills.length + periods.length + (sortMode !== "chaplist" ? 1 : 0);

	const periodPills = periods.map((id) => {
		const labels: Record<DeparturePeriod, string> = {
			aube: "Aube",
			matin: "Matin",
			"apres-midi": "Après-midi",
			soir: "Soir",
		};
		return {
			label: labels[id],
			choiceSlug: id,
			attributeSlug: "__period__",
		};
	});

	const allPills = [...pills, ...periodPills];

	const filterProps = {
		pills,
		clearFilters,
		attributeFiltersData,
		addAttributeFilter,
		sortMode,
		onSortModeChange: setSortMode,
		periods,
		onTogglePeriod: togglePeriod,
	};

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
				<ResultsDateTabs
					originName={data.origin.name}
					destinationName={data.destination.name}
					tripCount={itemsCounter}
				/>
			)}

			<div className="bg-[#FAFAFA]">
				<section
					className={`mx-auto flex w-full max-w-6xl gap-6 px-4 py-6 sm:px-8 ${
						!displayUpcomingTrip ? "flex-col md:flex-row" : "justify-center"
					}`}
				>
					{!displayUpcomingTrip && <SectionFilter {...filterProps} />}

					<ProductCollection
						where={productVariantsWhere}
						sortBy={
							sortMode === "cheapest"
								? { field: ProductVariantSortField.Price, direction: OrderDirection.Asc }
								: undefined
						}
						sortMode={sortMode}
						periods={periods}
						setCounter={setItemsCounter}
						perPage={10}
						originSlug={data.query?.origin ?? "abidjan"}
						destinationSlug={data.query?.destination ?? "yamoussoukro"}
						date={data.query?.date ?? data.date ?? ""}
						chosen={sortBy}
						displayUpcomingTrip={displayUpcomingTrip}
						operatorMeta={operatorMeta}
						pillsSlot={
							!displayUpcomingTrip && allPills.length > 0 ? (
								<FilterPills
									pills={allPills}
									onRemoveAttribute={(attributeSlug, choiceSlug) => {
										if (attributeSlug === "__period__") {
											togglePeriod(choiceSlug as DeparturePeriod);
											return;
										}
										removeAttributeFilter(attributeSlug, choiceSlug);
									}}
									onClearFilters={() => void clearFilters()}
								/>
							) : null
						}
					/>
				</section>
			</div>

			{!displayUpcomingTrip ? (
				<>
					<button
						type="button"
						onClick={() => setFilterOpen(true)}
						className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-bold text-white shadow-lg md:hidden"
					>
						<SlidersHorizontal className="h-4 w-4" aria-hidden />
						Filtrer & trier
						{activeFilterCount > 0 ? (
							<span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EB1700] px-1.5 text-[11px]">
								{activeFilterCount}
							</span>
						) : null}
					</button>

					<TripsFilterModal
						open={filterOpen}
						onClose={() => setFilterOpen(false)}
						{...filterProps}
						resultCount={itemsCounter}
					/>
				</>
			) : null}
		</>
	);
};
