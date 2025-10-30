"use client";

import { type ReactNode } from "react";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { createSaleorAuthClient } from "@saleor/auth-sdk";
import { SaleorAuthProvider } from "@saleor/auth-sdk/react";
import { saleorApiUrl } from "@/app/config";

const saleorAuthClient = createSaleorAuthClient({ saleorApiUrl });

const httpLink = new HttpLink({
	uri: saleorApiUrl,
	fetch: saleorAuthClient.fetchWithAuth as typeof fetch,
});

const apolloClient = new ApolloClient({
	link: httpLink,
	cache: new InMemoryCache(),
});

export function Providers({ children }: { children: ReactNode }) {
	return (
		<SaleorAuthProvider client={saleorAuthClient}>
			<ApolloProvider client={apolloClient}>{children}</ApolloProvider>
		</SaleorAuthProvider>
	);
}
