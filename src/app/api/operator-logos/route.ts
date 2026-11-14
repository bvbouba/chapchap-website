import { NextResponse } from "next/server";
import { loadOperatorLogoMap } from "@/lib/loadOperatorLogoMap";
import { resolveOperatorLogo } from "@/lib/loadOperatorLogoMap";

export const revalidate = 1800;

/**
 * Public operator logos for the customer mobile app (no Saleor app token on device).
 * GET /api/operator-logos          → { logos: { [slug]: url } }
 * GET /api/operator-logos?slug=x   → { slug, logoUrl }
 */
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const slug = searchParams.get("slug")?.trim();

		if (slug) {
			const logoUrl = await resolveOperatorLogo(slug);
			return NextResponse.json(
				{ slug, logoUrl: logoUrl || null },
				{
					headers: {
						"Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
						"Access-Control-Allow-Origin": "*",
					},
				},
			);
		}

		const logos = await loadOperatorLogoMap();
		return NextResponse.json(
			{ logos },
			{
				headers: {
					"Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
					"Access-Control-Allow-Origin": "*",
				},
			},
		);
	} catch (err) {
		console.error("GET /api/operator-logos failed:", err);
		return NextResponse.json({ error: "Failed to load logos" }, { status: 500 });
	}
}
