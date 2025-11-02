import { OrderDirection, ProductVariantSortField } from "@/gql/graphql";

export interface UrlSorting {
  field: ProductVariantSortField;
  direction: OrderDirection;
}

export interface SortingOption {
  label: string;
  field?: ProductVariantSortField;
  direction?: OrderDirection;
  chosen: boolean;
}

export const getSortingOptions = (chosenSorting: UrlSorting | null) => {
  const options: SortingOption[] = [
    { label: "Popularité", chosen: false },
    { label: "Moins cher", field: ProductVariantSortField.Price, direction: OrderDirection.Asc, chosen: false },
  ];

  let isChosenSet = false;
  for (const option of options) {
    if (option.field === chosenSorting?.field && option.direction === chosenSorting?.direction) {
      option.chosen = true;
      isChosenSet = true;
      break;
    }
  }
  if (!isChosenSet) {
    options[0].chosen = true;
  }
  return options;
};

export const parseQuerySort = (query: string | null): UrlSorting | null => {
  if (!query) {
    return null;
  }
  const [field, direction] = query.split("_");
  if (!field || !direction) {
    return null;
  }
  const sorting: UrlSorting = {
    field: field as ProductVariantSortField,
    direction: direction as OrderDirection,
  };

  return sorting;
};

export const serializeQuerySort = (value?: UrlSorting | null) => {
  if (value?.direction && value?.field) {
    return `${value.field}_${value.direction}`;
  }
  return null;
};
