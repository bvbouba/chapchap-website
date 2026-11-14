/**
 * Auth headers for Saleor queries that require AUTHENTICATED_APP
 * (e.g. `channel`, `channels`).
 */
export function saleorAppAuth():
	| { withAuth: false; headers: { Authorization: string } }
	| null {
	const token = process.env.SALEOR_APP_TOKEN?.trim();
	if (!token) return null;
	return {
		withAuth: false,
		headers: { Authorization: `Bearer ${token}` },
	};
}
