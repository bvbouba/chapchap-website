import { redirect } from "next/navigation";

/** Alias → /conditions (CMS slug `conditions`). */
export default async function TermsConditionsAliasPage({
	params,
}: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await params;
	redirect(`/${encodeURIComponent(channel)}/conditions`);
}
