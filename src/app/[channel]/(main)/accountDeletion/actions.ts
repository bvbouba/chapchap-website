"use server";

import { TypedDocumentString } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

type RequestAccountDeletionMutation = {
	accountRequestDeletion?: {
		token?: string | null;
		errors: Array<{ code: string; message?: string | null }>;
	} | null;
};

type RequestAccountDeletionVariables = {
	redirectUrl: string;
	channel: string;
	noNotification?: boolean | null;
};

type DeleteAccountMutation = {
	accountDelete?: {
		errors: Array<{ code: string; message?: string | null }>;
		user?: { id: string; firstName: string; email: string } | null;
	} | null;
};

type DeleteAccountVariables = { token: string };

const RequestAccountDeletionDocument = new TypedDocumentString(`
	mutation RequestAccountDeletion($redirectUrl: String!, $channel: String!, $noNotification: Boolean) {
		accountRequestDeletion(
			redirectUrl: $redirectUrl
			channel: $channel
			noNotification: $noNotification
		) {
			token
			errors {
				code
				message
			}
		}
	}
`) as unknown as TypedDocumentString<RequestAccountDeletionMutation, RequestAccountDeletionVariables>;

const DeleteAccountDocument = new TypedDocumentString(`
	mutation DeleteAccount($token: String!) {
		accountDelete(token: $token) {
			errors {
				code
				message
			}
			user {
				id
				firstName
				email
			}
		}
	}
`) as unknown as TypedDocumentString<DeleteAccountMutation, DeleteAccountVariables>;

export async function requestAccountDeletion(
	redirectUrl: string,
	channel: string,
	noNotification: boolean = false,
) {
	try {
		const { accountRequestDeletion } = await executeGraphQL(RequestAccountDeletionDocument, {
			variables: { redirectUrl, channel, noNotification },
			cache: "no-cache",
		});

		if (accountRequestDeletion?.errors?.length) {
			return {
				success: false,
				error: accountRequestDeletion.errors[0]?.message || "Impossible de demander la suppression.",
			};
		}

		return {
			success: true,
			token: accountRequestDeletion?.token ?? null,
		};
	} catch {
		return { success: false, error: "Impossible de demander la suppression." };
	}
}

export async function deleteAccount(token: string) {
	try {
		const { accountDelete } = await executeGraphQL(DeleteAccountDocument, {
			variables: { token },
			cache: "no-cache",
		});

		if (accountDelete?.errors?.length) {
			return {
				success: false,
				error: accountDelete.errors[0]?.message || "Impossible de supprimer le compte.",
			};
		}

		return {
			success: true,
			user: accountDelete?.user ?? null,
		};
	} catch {
		return { success: false, error: "Impossible de supprimer le compte." };
	}
}
