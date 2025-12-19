export interface PaginationProps {
	pageInfo?: {
		hasNextPage?: boolean;
	};
	onLoadMore: () => void;
	totalCount?: number;
	itemsCount?: number;
}

export function Pagination({ pageInfo, onLoadMore, itemsCount, totalCount }: PaginationProps) {
	if (!pageInfo || !pageInfo?.hasNextPage) {
		return null;
	}

	return (
		<nav className="mt-8 p-4">
			<div className="flex flex-col items-center justify-center">
				<button
					type="button"
					onClick={onLoadMore}
					className="relative inline-flex cursor-pointer items-center rounded-md border bg-gray-50   px-4 py-2 text-base text-gray-700 transition hover:border-primary"
				>
					Charger plus
				</button>
				{itemsCount && totalCount && (
					<div className="mt-2 text-sm text-gray-500">
						Affichage de <span className=" ">{itemsCount}</span> sur <span className=" ">{totalCount}</span>{" "}
						produits
					</div>
				)}
			</div>
		</nav>
	);
}
