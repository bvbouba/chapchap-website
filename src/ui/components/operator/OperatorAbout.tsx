import {
	AirVent,
	Luggage,
	Plug,
	Snowflake,
	Tv,
	Wifi,
	type LucideIcon,
} from "lucide-react";

const AMENITY_ICONS: Array<{ match: RegExp; Icon: LucideIcon; label: string }> = [
	{ match: /wifi|wi-fi/, Icon: Wifi, label: "Wi-Fi" },
	{ match: /climat|ac\b|air.?cond|snow/, Icon: Snowflake, label: "Climatisation" },
	{ match: /usb|prise|electri|plug/, Icon: Plug, label: "Prises USB" },
	{ match: /bagage|luggage|soute/, Icon: Luggage, label: "Bagages" },
	{ match: /tv|télé|tele/, Icon: Tv, label: "TV" },
	{ match: /vent/, Icon: AirVent, label: "Ventilation" },
];

function amenityPresentation(slug: string): { Icon: LucideIcon; label: string } {
	const key = slug.toLowerCase().replace(/[_-]+/g, " ");
	for (const row of AMENITY_ICONS) {
		if (row.match.test(key)) return { Icon: row.Icon, label: row.label };
	}
	const label = slug
		.split(/[-_]/)
		.filter(Boolean)
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join(" ");
	return { Icon: Luggage, label };
}

type Props = {
	description: string;
	amenitySlugs: string[];
};

export function OperatorAbout({ description, amenitySlugs }: Props) {
	const hasBody = Boolean(description.trim());
	const amenities = amenitySlugs.filter(Boolean);
	if (!hasBody && amenities.length === 0) return null;

	return (
		<section aria-labelledby="operator-about-title" className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
			<h2 id="operator-about-title" className="text-xl font-bold text-[#111111] sm:text-2xl">
				À propos
			</h2>
			{hasBody ? (
				<p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-[#505050] sm:text-base">
					{description}
				</p>
			) : null}

			{amenities.length > 0 ? (
				<div className="mt-8">
					<h3 className="text-sm font-bold uppercase tracking-wide text-[#606060]">
						Services à bord
					</h3>
					<ul className="mt-4 flex flex-wrap gap-3">
						{amenities.map((slug) => {
							const { Icon, label } = amenityPresentation(slug);
							return (
								<li
									key={slug}
									className="inline-flex items-center gap-2 rounded-full border border-[#E8E9EC] bg-white px-4 py-2 text-sm font-medium text-[#303030]"
								>
									<Icon className="h-4 w-4 text-[#6C8D26]" aria-hidden />
									{label}
								</li>
							);
						})}
					</ul>
				</div>
			) : null}
		</section>
	);
}
