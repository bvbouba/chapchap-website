import { ShopCompanyAddressDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export type ShopContactInfo = {
	companyName: string;
	phoneDisplay: string;
	phoneE164: string;
	streetAddress1: string;
	city: string;
};

function toE164(phone: string): string {
	const digits = phone.replace(/\D/g, "");
	if (!digits) return "";
	// Keep full international digits (e.g. 225… or 1…)
	return digits;
}

function formatPhoneDisplay(phone: string): string {
	const trimmed = phone.trim();
	return trimmed || "";
}

export async function loadShopContact(): Promise<ShopContactInfo> {
	try {
		const res = await executeGraphQL(ShopCompanyAddressDocument, {
			revalidate: 60 * 30,
			withAuth: false,
		});
		const addr = res.shop?.companyAddress;
		const phone = (addr?.phone ?? "").trim();
		return {
			companyName: (addr?.companyName ?? "").trim() || "ChapChap Tickets",
			phoneDisplay: formatPhoneDisplay(phone),
			phoneE164: toE164(phone),
			streetAddress1: (addr?.streetAddress1 ?? "").trim(),
			city: (addr?.city ?? "").trim(),
		};
	} catch (error) {
		console.error("ShopCompanyAddress failed:", error);
		return {
			companyName: "ChapChap Tickets",
			phoneDisplay: "",
			phoneE164: "",
			streetAddress1: "",
			city: "",
		};
	}
}

export function whatsappUrlFromE164(phoneE164: string, prefill?: string): string {
	const digits = phoneE164.replace(/\D/g, "");
	const text = prefill?.trim()
		? `?text=${encodeURIComponent(prefill.trim())}`
		: "";
	return `https://wa.me/${digits}${text}`;
}

export function telHrefFromE164(phoneE164: string): string {
	const digits = phoneE164.replace(/\D/g, "");
	return digits ? `tel:+${digits}` : "tel:";
}
