export interface BottomPaginationProps {
    pageInfo?: { hasNextPage?: boolean };
    onLoadMore: () => void;
  }
  
  export function BottomPagination({ pageInfo, onLoadMore }: BottomPaginationProps) {
    if (!pageInfo?.hasNextPage) return null;
  
    return (
      <div className="mt-8 flex justify-start">
        <button
          type="button"
          onClick={onLoadMore}
          className="px-4 py-2 border text-base   rounded-md text-gray-700 bg-gray-50 hover:border-primary transition cursor-pointer"
        >
          Voir plus
        </button>
      </div>
    );
  }
  