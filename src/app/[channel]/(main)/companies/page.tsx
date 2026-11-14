import { redirect } from "next/navigation";

/** English alias → French directory. */
export default async function CompaniesAliasPage({
	params,
}: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await params;
	redirect(`/${encodeURIComponent(channel)}/compagnies`);
}
