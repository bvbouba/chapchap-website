import { NextResponse } from "next/server";

/**
 * Legacy endpoint — trip search now uses `/api/product-collection`.
 * Kept so old clients don't 404; returns an empty product list.
 */
export async function POST() {
	return NextResponse.json({
		products: { edges: [], totalCount: 0, pageInfo: { hasNextPage: false } },
	});
}
