import * as Checkout from "@/lib/checkout";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import CartDetail from "@/ui/components/cart/CartDetail";
import ProgressHeader from "@/ui/components/ProgressHeader";

export const metadata = {
    title: "Panier · ChapChap Tickets",
};

export default async function Page(props: { params: Promise<{ channel: string }> }) {
    const params = await props.params;
    const checkoutId = await Checkout.getIdFromCookies(params.channel);

    const checkout = await Checkout.find(checkoutId);
    
    if (!checkout || checkout.lines.length < 1) {
        return (
            <section className="mx-auto max-w-7xl p-8">
                <h1 className="mt-8 text-3xl text-neutral-900">Votre panier est vide</h1>
                <p className="my-12 text-sm text-neutral-500">
                    Il semble que vous n'ayez pas encore ajouté de trajets à votre panier.
                </p>
                <LinkWithChannel
                    href="/"
                    className="inline-block max-w-full rounded border border-transparent bg-neutral-900 px-6 py-3 text-center text-neutral-50 hover:bg-neutral-800 aria-disabled:cursor-not-allowed aria-disabled:bg-neutral-500 sm:px-16"
                >
                    Rechercher un trajet
                </LinkWithChannel>
            </section>
        );
    }
    
    return (
        <>
            <ProgressHeader />

            <CartDetail checkout={checkout} />
        </>
    );
}