import { EllipsisLoader } from "@/ui/components/EllipsisLoader";

export function Loader() {
	return (
		<div className="flex justify-center py-10 text-center" aria-busy="true" role="status">
			<EllipsisLoader label="Chargement…" color="#A6C65A" />
		</div>
	);
}
