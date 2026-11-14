import { type ReactNode } from "react";
import { executeGraphQL } from "@/lib/graphql";
import { ChannelsListDocument } from "@/gql/graphql";
import { saleorAppAuth } from "@/lib/saleorAppAuth";

export const generateStaticParams = async () => {
	// the `channels` query is protected — needs SALEOR_APP_TOKEN
	const appAuth = saleorAppAuth();
	if (appAuth) {
		try {
			const channels = await executeGraphQL(ChannelsListDocument, {
				...appAuth,
			});
			const params =
				channels.channels
					?.filter((channel) => channel.isActive)
					.map((channel) => ({ channel: channel.slug })) ?? [];
			if (params.length > 0) return params;
		} catch (err) {
			console.warn("generateStaticParams: channels fetch failed, falling back to ci", err);
		}
	}
	return [{ channel: "ci" }];
};

export default function ChannelLayout({ children }: { children: ReactNode }) {
	return children;
}
