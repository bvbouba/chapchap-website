import { type Metadata } from "next";
import { generateLegalMetadata, LegalCmsPage } from "@/lib/legalCmsPage";

const CONFIG = {
	cmsSlug: "conditions",
	defaultTitle: "Conditions Générales d'Utilisation et de Vente (CGU / CGV)",
	defaultDescription:
		"Conditions générales ChapChap Tickets : billetterie, Mobile Money, annulations et droit ivoirien / OHADA.",
	eyebrow: "Cadre légal · Côte d'Ivoire · OHADA",
	intro:
		"En utilisant ChapChap Tickets, vous acceptez ces conditions. Elles précisent le rôle de la plateforme, les paiements Mobile Money et la responsabilité des compagnies de transport partenaires.",
} as const;

export function generateMetadata(): Promise<Metadata> {
	return generateLegalMetadata(CONFIG);
}

export default function ConditionsPage() {
	return LegalCmsPage(CONFIG);
}
