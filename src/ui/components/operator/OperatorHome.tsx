import { HeroSearch, type citiesType } from "@/ui/components/HeroSearch/HeroSearch";
import { OperatorAbout } from "@/ui/components/operator/OperatorAbout";
import { OperatorPolicies } from "@/ui/components/operator/OperatorPolicies";
import { OperatorRoutesTable } from "@/ui/components/operator/OperatorRoutesTable";
import { OperatorTrustBar } from "@/ui/components/operator/OperatorTrustBar";
import type { CompanyProfileFields } from "@/lib/companyProfile";
import type { OperatorRouteRow } from "@/lib/operatorHomepage";

export type OperatorHomeProps = {
	channel: string;
	cities: citiesType;
	profile: CompanyProfileFields;
	routes: OperatorRouteRow[];
	bagages: string | null;
	cancellation: string | null;
	stations: string[];
};

export function OperatorHome({
	channel,
	cities,
	profile,
	routes,
	bagages,
	cancellation,
	stations,
}: OperatorHomeProps) {
	const displayName = profile.displayName.trim() || "Compagnie";

	return (
		<>
			<div id="search">
				<HeroSearch
					cities={cities}
					operator={{
						displayName,
						slogan: profile.slogan,
						logoUrl: profile.logoUrl,
					}}
				/>
			</div>
			<OperatorTrustBar />
			<OperatorAbout description={profile.description} amenitySlugs={profile.amenitySlugs} />
			<OperatorRoutesTable channel={channel} routes={routes} />
			<OperatorPolicies
				bagages={bagages || profile.bagagesAllowed || null}
				cancellation={cancellation || profile.cancellationHours || null}
				stations={stations}
				supportPhone={profile.supportPhone}
				supportEmail={profile.supportEmail}
			/>
		</>
	);
}
