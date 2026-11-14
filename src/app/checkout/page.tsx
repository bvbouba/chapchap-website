import Link from "next/link";
import { invariant } from "ts-invariant";
import { RootWrapper } from "./pageWrapper";

export const metadata = {
	title: "ChapChap Tickets · Paiement & confirmation",
};

export default async function CheckoutPage(props: {
	searchParams: Promise<{ checkout?: string; order?: string }>;
}) {
	const searchParams = await props.searchParams;
	invariant(process.env.NEXT_PUBLIC_SALEOR_API_URL, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

	if (!searchParams.checkout && !searchParams.order) {
		return null;
	}

	const isOrderConfirmation = Boolean(searchParams.order);

	return (
		<div className="min-h-dvh bg-[#FAFAFA]">
			<section className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-6 sm:px-8 sm:py-8">
				<div className="flex items-center font-bold text-[#111111] print:hidden">
					<Link aria-label="accueil" href="/">
						ChapChap Tickets
					</Link>
				</div>
				{!isOrderConfirmation ? (
					<>
						<h1 className="mt-6 text-2xl font-bold text-[#111111] sm:text-3xl">
							Coordonnées & Passagers
						</h1>
						<p className="mt-1 text-sm text-[#606060]">
							Étape 3 sur 3 : Paiement sécurisé Mobile Money
						</p>
					</>
				) : null}

				<section className={`mb-12 flex-1 ${isOrderConfirmation ? "mt-6" : "mt-6"}`}>
					<RootWrapper saleorApiUrl={process.env.NEXT_PUBLIC_SALEOR_API_URL} />
				</section>
			</section>
		</div>
	);
}
