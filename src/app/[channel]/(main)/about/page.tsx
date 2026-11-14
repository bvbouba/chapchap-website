import { redirect } from "next/navigation";

/** English alias → /a-propos */
export default async function AboutAliasPage({
	params,
}: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await params;
	redirect(`/${encodeURIComponent(channel)}/a-propos`);
}
