"use client"

import { queryTypes, useQueryState } from "next-usequerystate";
import { useEffect, useState } from "react";



import {
  getFilterOptions,
  getPillsData,
  parseQueryAttributeFilters,
  serializeQueryAttributeFilters,
  UrlFilter,
} from "./attributes";
import { parseQuerySort, serializeQuerySort, UrlSorting } from "./sorting";
import { FilterPill } from "./FilterPills";
import { AssignedAttributeValueFragment, AttributeFilterFragment, OrderDirection, ProductVariantSortField, ProductVariantWhereInput } from "@/gql/graphql";
import { ProductCollection } from "../../ProductCollection";
import { useTripSearch } from "@/context/TripSearchContext";
import SimpleHeroSearch from "../../HeroSearch/SimpleHeroSearch";
import TripHeader from "../../trips/TripHeader";
import FilterElement from "./FilterElement";

export interface FilteredProductListProps {
  attributeFiltersData: AttributeFilterFragment[];
  collectionIDs?: string[];
  categoryIDs?: string[];
  originData: AssignedAttributeValueFragment | null | undefined;
  destinationData: AssignedAttributeValueFragment | null | undefined;
  date: string;
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
  date,
}: FilteredProductListProps) {
  const [queryFilters, setQueryFilters] = useQueryState("filters", {
    parse: parseQueryAttributeFilters,
    serialize: serializeQueryAttributeFilters,
    defaultValue: [],
  });

  const [itemsCounter, setItemsCounter] = useState(0);

  const [sortByQuery, setSortByQuery] = useQueryState("sortBy", {});

  const sortBy = parseQuerySort(sortByQuery);
  const setSortBy = (value: UrlSorting | undefined | null) =>
    setSortByQuery(serializeQuerySort(value));

  const [inStockFilter, setInStockFilter] = useQueryState(
    "inStock",
    queryTypes.boolean.withDefault(false)
  );

  const [productVariantsWhere, setProductVariantsWhere] = useState<ProductVariantWhereInput>();

  const pills: FilterPill[] = getPillsData(queryFilters, attributeFiltersData);

  const { data, setData } = useTripSearch();

  // ✅ Initialize context when data arrives
  useEffect(() => {
    if (originData && destinationData) {
      setData({
        tripType: "oneway",
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
        date,
      });
    }
  }, [originData, destinationData, date, setData]);

  useEffect(() => {
    setProductVariantsWhere({
      attributes: queryFilters.filter((filter) => filter.value.slug.oneOf.length),
      ...(categoryIDs?.length && { categories: categoryIDs }),
      ...(collectionIDs?.length && { collections: collectionIDs }),
    });
    // Eslint does not recognize stringified queryFilters, so we have to ignore it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inStockFilter, JSON.stringify(queryFilters), categoryIDs, collectionIDs]);

  const removeAttributeFilter = (attributeSlug: string, choiceSlug: string) => {
    const newFilters = queryFilters.reduce((result: UrlFilter[], filter: UrlFilter) => {
      if (filter.slug !== attributeSlug) {
        return [...result, filter];
      }
      const newFilterValues = filter.value.slug.oneOf.filter((value) => value !== choiceSlug);
      if (newFilterValues?.length) {
        return [...result, { ...filter, values: newFilterValues }];
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
      (pill) => pill.attributeSlug === attributeSlug && pill.choiceSlug === choiceSlug
    );
    if (isFilterAlreadyApplied) {
      removeAttributeFilter(attributeSlug, choiceSlug);
      return;
    }

    // if attribute was not used before, add it
    const existingFilter = queryFilters.find((filter) => filter.slug === attributeSlug);
    if (!existingFilter) {
      setQueryFilters([...queryFilters, { slug: attributeSlug, value:{slug: {oneOf: [choiceSlug]} }}], {
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
  return (
    <>
      <SimpleHeroSearch data={data} />
      <TripHeader destinationName={data.destination.name} date={data.date} />
      <div className="mt-4">
        <section className="flex flex-col md:flex-row w-full max-w-6xl mx-auto py-8 px-4 gap-6">
          {/* ✅ Filters Sidebar */}
          <aside className="mb-6 flex flex-col gap-4">
            {/* Reset All Filters Button */}
            {pills.length > 0 &&  <div className="border-b border-gray-200 mb-6">
            <button
              onClick={clearFilters}
              className="py-2 text-[#97D700] px-4 rounded-md text-sm hover:text-red-600 transition"
            >
              Réinitialiser tous les filtres
            </button>
            </div>}
            {/* Attribute Filters */}
            {attributeFiltersData.map((attribute) => (
              <FilterElement
                key={attribute.id}
                label={attribute.name || ""}
                optionToggle={addAttributeFilter}
                attributeSlug={attribute.slug!}
                options={getFilterOptions(attribute, pills)}
              />
            ))}
          </aside>
         
          <ProductCollection
            where={productVariantsWhere}
            sortBy={sortBy || undefined}
            setCounter={setItemsCounter}
            perPage={40}
            originSlug={data.origin.slug}
            destinationSlug={data.destination.slug}
            date={data.date}
            optionToggle={(field?: ProductVariantSortField, direction?: OrderDirection) => {
              setSortBy(field && direction ? { field, direction } : null);
            }}
            chosen={sortBy}
          />
        </section>
      </div>
    </>
  );
}

export default FilteredProductList;
