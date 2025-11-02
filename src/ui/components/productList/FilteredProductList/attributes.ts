import { mapEdgesToItems } from "@/lib/maps";

import { FilterDropdownOption } from "./FilterDropdown";
import { FilterPill } from "./FilterPills";
import { AttributeFilterFragment } from "@/gql/graphql";

export interface UrlFilter {
  slug: string;
  value: {
    slug:{
      oneOf:string[]
    }
  };
}

export const getPillsData = (
  urlFilters: UrlFilter[],
  attributeFiltersData: AttributeFilterFragment[]
): FilterPill[] =>
  urlFilters.reduce((result: FilterPill[], filter: UrlFilter) => {
    const choiceAttribute = attributeFiltersData.find((attr) => attr.slug === filter.slug);
    const attrName = choiceAttribute ? choiceAttribute.name : filter.slug;
    const newPills = filter.value.slug.oneOf.map((value) => {
      const attrChoice = choiceAttribute?.choices?.edges.find(
        (choice) => choice.node.slug === value
      );
      const choiceName = attrChoice?.node.name || value;
      return {
        label: `${attrName}: ${choiceName}`,
        choiceSlug: value,
        attributeSlug: filter.slug,
      };
    });
    return [...result, ...newPills];
  }, []);

export const getFilterOptions = (
  attribute: AttributeFilterFragment,
  appliedFilters: FilterPill[]
): FilterDropdownOption[] => {
  const choices = mapEdgesToItems(attribute.choices);

  return choices.map((choice) => ({
    chosen: !!appliedFilters.find(
      (pill) => pill.attributeSlug === attribute.slug && pill.choiceSlug === choice.slug
    ),
    id: choice.id,
    label: choice.name || choice.id,
    slug: choice.slug || choice.id,
  }));
};

export const parseQueryAttributeFilters = (query: string): UrlFilter[] => {
  const filters: UrlFilter[] = [];
  query.split(";").map((attributeWithValues) => {
    const splitted = attributeWithValues.split(".");
    const attributeFilter = { slug: splitted[0], values: splitted.slice(1) };
    if (attributeFilter.values.length > 0) {
      filters.push({
        slug:splitted[0],
        value: {
          slug: {
            oneOf: splitted.slice(1),
          },
        },
      });
    }
  });
  return filters;
};

export const serializeQueryAttributeFilters = (values: UrlFilter[]): string =>
  values.map((value) => [value.slug, ...value.value.slug.oneOf].join(".")).join(";");
