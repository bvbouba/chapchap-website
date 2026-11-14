import Link from "next/link";
import { formatPriceFcfa, type OperatorRouteRow } from "@/lib/operatorHomepage";

type Props = {
	channel: string;
	routes: OperatorRouteRow[];
};

export function OperatorRoutesTable({ channel, routes }: Props) {
	return (
		<section aria-labelledby="operator-routes-title" className="border-y border-[#E8E9EC] bg-[#FAFAFA]">
			<div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
				<h2 id="operator-routes-title" className="text-xl font-bold text-[#111111] sm:text-2xl">
					Lignes principales & tarifs
				</h2>

				{routes.length === 0 ? (
					<p className="mt-4 text-sm text-[#606060]">
						Aucune ligne publiée pour le moment. Utilisez la recherche ci-dessus pour trouver un
						trajet.
					</p>
				) : (
					<div className="mt-6 overflow-x-auto rounded-2xl border border-[#E8E9EC] bg-white">
						<table className="min-w-full text-left text-sm">
							<thead className="border-b border-[#E8E9EC] bg-[#FAFAFA] text-xs uppercase tracking-wide text-[#606060]">
								<tr>
									<th className="px-4 py-3 font-semibold">Trajet</th>
									<th className="px-4 py-3 font-semibold">Durée est.</th>
									<th className="px-4 py-3 font-semibold">Prix à partir de</th>
									<th className="px-4 py-3 font-semibold">
										<span className="sr-only">Action</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{routes.map((row) => {
									const href =
										row.originId && row.destinationId
											? `/${encodeURIComponent(channel)}/trips/${encodeURIComponent(row.originId)}/${encodeURIComponent(row.destinationId)}`
											: `/${encodeURIComponent(channel)}#search`;
									return (
										<tr key={row.productId} className="border-b border-[#E8E9EC] last:border-0">
											<td className="px-4 py-3 font-medium text-[#111111]">{row.label}</td>
											<td className="px-4 py-3 text-[#505050]">{row.durationLabel ?? "—"}</td>
											<td className="px-4 py-3 font-semibold text-[#303030]">
												{formatPriceFcfa(row.priceAmount, row.currency)}
											</td>
											<td className="px-4 py-3 text-right">
												<Link
													href={href}
													className="inline-flex rounded-full bg-[#A6C65A] px-3 py-1.5 text-xs font-bold text-[#1A1A1A] hover:bg-[#97b84f]"
												>
													Voir les horaires
												</Link>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
}
