import { redirect } from "next/navigation";

/** French alias → /partners */
export default async function DevenirPartenaireAliasPage({
	params,
}: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await params;
	redirect(`/${encodeURIComponent(channel)}/partners`);
}
