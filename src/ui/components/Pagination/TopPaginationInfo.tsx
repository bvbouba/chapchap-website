export interface TopPaginationInfoProps {
	itemsCount?: number;
	totalCount?: number;
}

export function TopPaginationInfo({ itemsCount, totalCount }: TopPaginationInfoProps) {
	if (!itemsCount || !totalCount) return null;

	return (
		<div className="text-sm text-gray-600">
			Affichage de <span className="font-semibold">{itemsCount}</span> sur{" "}
			<span className="font-semibold">{totalCount}</span> {totalCount > 1 ? "trajets" : "trajet"}
		</div>
	);
}
