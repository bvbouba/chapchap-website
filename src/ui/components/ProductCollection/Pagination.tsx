export interface PaginationProps {
  pageInfo?: {
    hasNextPage?: boolean;
  };
  onLoadMore: () => void;
  totalCount?: number;
  itemsCount?: number;
}

export function Pagination({
  pageInfo,
  onLoadMore,
  itemsCount,
  totalCount,
}: PaginationProps) {
  if (!pageInfo || !pageInfo?.hasNextPage) {
    return null;
  }

  return (
    <nav className="mt-8 p-4">
      <div className="flex justify-center flex-col items-center">
        <button
          type="button"
          onClick={onLoadMore}
          className="relative inline-flex items-center px-4 py-2 border text-base   rounded-md text-gray-700 bg-gray-50 hover:border-primary transition cursor-pointer"
        >
          Charger plus
        </button>
        {itemsCount && totalCount && (
          <div className="text-sm text-gray-500 mt-2">
            Affichage de <span className=" ">{itemsCount}</span> sur{" "}
            <span className=" ">{totalCount}</span> produits
          </div>
        )}
      </div>
    </nav>
  );
}
