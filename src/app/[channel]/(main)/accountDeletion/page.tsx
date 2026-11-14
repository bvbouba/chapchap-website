import { AccountDeletionForm } from "./form";
import { CurrentUserDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const metadata = {
	title: "Supprimer mon compte · ChapChap Tickets",
	description: "Suppression définitive de votre compte ChapChap Tickets.",
};

export default async function AccountDeletionPage(props: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await props.params;
	const { me: user } = await executeGraphQL(CurrentUserDocument, {
		cache: "no-cache",
	});

	return <AccountDeletionForm user={user} channel={channel} />;
}
