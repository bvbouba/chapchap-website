import { redirect } from "next/navigation";

export default async function ContactAliasPage({
	params,
}: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await params;
	redirect(`/${encodeURIComponent(channel)}/contactus`);
}
