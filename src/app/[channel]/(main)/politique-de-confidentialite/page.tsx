import { redirect } from "next/navigation";

/** Alias → /privacy-policy (CMS slug `privacy-policy`). */
export default async function PolitiqueConfidentialiteAliasPage({
	params,
}: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await params;
	redirect(`/${encodeURIComponent(channel)}/privacy-policy`);
}
