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
				className="cursor-pointer rounded-md border bg-gray-50   px-4 py-2 text-base text-gray-700 transition hover:border-primary"
			>
				Voir plus
			</button>
		</div>
	);
}
