import { type Metadata } from "next";
import { generateLegalMetadata, LegalCmsPage } from "@/lib/legalCmsPage";

const CONFIG = {
	cmsSlug: "privacy-policy",
	defaultTitle: "Politique de Confidentialité",
	defaultDescription:
		"Politique de confidentialité ChapChap Tickets : protection des données personnelles (Loi n° 2013-450), Mobile Money, SMS et WhatsApp — Côte d'Ivoire / ARTCI.",
	eyebrow: "Protection des données · Loi n° 2013-450 · ARTCI",
	intro:
		"Cette politique explique quelles données nous collectons, pourquoi nous les utilisons (e-billets SMS/WhatsApp, embarquement, fraude) et quels sont vos droits en Côte d'Ivoire.",
} as const;

export function generateMetadata(): Promise<Metadata> {
	return generateLegalMetadata(CONFIG);
}

export default function PrivacyPolicyPage() {
	return LegalCmsPage(CONFIG);
}
