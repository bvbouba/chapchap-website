type Props = {
	title: string;
	eyebrow: string;
	intro: string;
	updatedLabel?: string;
	htmlFragments: string[];
};

export function LegalDocumentPage({
	title,
	eyebrow,
	intro,
	updatedLabel = "Dernière mise à jour : Août 2026",
	htmlFragments,
}: Props) {
	return (
		<>
			<section className="border-b border-[#E8E9EC] bg-[#FAFAFA]">
				<div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
					<p className="text-xs font-semibold uppercase tracking-wide text-[#6C8D26]">{eyebrow}</p>
					<h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
						{title}
					</h1>
					<p className="mt-3 text-sm text-[#606060]">{updatedLabel}</p>
					<p className="mt-4 max-w-2xl text-sm leading-6 text-[#505050]">{intro}</p>
				</div>
			</section>

			<section className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:pb-16">
				{htmlFragments.length === 0 ? (
					<p className="text-sm text-[#606060]">Le contenu de cette page n&apos;est pas encore disponible.</p>
				) : (
					<article
						className={[
							"legal-prose space-y-4 text-[15px] leading-7 text-[#303030]",
							"[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-[#111111]",
							"[&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#111111]",
							"[&_h4]:mt-6 [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-[#111111]",
							"[&_h2:first-child]:mt-0 [&_h3:first-child]:mt-0",
							"[&_p]:text-[#404040]",
							"[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
							"[&_li]:text-[#404040]",
							"[&_strong]:font-semibold [&_strong]:text-[#111111]",
							"[&_em]:italic",
							"[&_blockquote]:border-l-2 [&_blockquote]:border-[#E8E9EC] [&_blockquote]:pl-4 [&_blockquote]:text-[#505050]",
							"[&_a]:font-semibold [&_a]:text-[#EB1700] [&_a]:underline",
						].join(" ")}
					>
						{htmlFragments.map((html, index) => (
							<div
								key={`${index}-${html.slice(0, 24)}`}
								dangerouslySetInnerHTML={{ __html: html }}
							/>
						))}
					</article>
				)}
			</section>
		</>
	);
}
