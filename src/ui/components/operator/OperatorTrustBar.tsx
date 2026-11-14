import { BadgeCheck } from "lucide-react";

export function OperatorTrustBar() {
	return (
		<section aria-label="Confiance" className="border-y border-[#E8E9EC] bg-[#FAFAFA]">
			<div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-4 sm:px-8">
				<span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F7E4]">
					<BadgeCheck className="h-5 w-5 text-[#6C8D26]" aria-hidden />
				</span>
				<p className="text-sm font-semibold text-[#303030] sm:text-base">
					Transporteur Partenaire Vérifié · ChapChap Tickets
				</p>
			</div>
		</section>
	);
}
