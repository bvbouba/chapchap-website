import { Suspense } from "react";
import { Summary, SummarySkeleton } from "@/checkout/sections/Summary";
import { OrderInfo } from "@/checkout/sections/OrderInfo";
import { useOrder } from "@/checkout/hooks/useOrder";

export const OrderConfirmation = () => {
    const { order } = useOrder();
    console.log(order)
    return (
        <main className="grid grid-cols-1 gap-x-16 lg:grid-cols-2">
            <div>
                <header>
                    <p className="mb-2 text-lg" data-testid="orderConfrmationTitle">
                        Commande #{order.number} confirmée
                    </p>
                    <p className="text-base">
                        Merci pour votre commande. Nous l&apos;avons bien reçue et nous vous contacterons dès que votre
                        billet sera prêt. Un e-mail de confirmation a été envoyé à {order.userEmail}.
                    </p>
                </header>
                <OrderInfo />
            </div>
            <Suspense fallback={<SummarySkeleton />}>
                <Summary
                    // pour l'instant, il ne peut y avoir qu'un seul bon de réduction par commande dans l'API
                    discount={order?.discounts?.find(({ type }) => type === "VOUCHER")?.amount}
                    voucherCode={order?.voucher?.code}
                    totalPrice={order?.total}
                    subtotalPrice={order?.subtotal}
                    editable={false}
					lines={order.lines}
					shippingPrice={order.shippingPrice}
                />
            </Suspense>
        </main>
    );
};