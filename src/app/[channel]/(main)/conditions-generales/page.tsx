import { redirect } from "next/navigation";

/** Alias → /conditions (CMS slug `conditions`). */
export default async function ConditionsGeneralesAliasPage({
	params,
}: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await params;
	redirect(`/${encodeURIComponent(channel)}/conditions`);
}
