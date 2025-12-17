"use client";

import { useState, useTransition } from "react";
import "dayjs/locale/fr";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { CheckoutErrorFragment, CheckoutFragment, MoneyFragment } from "@/gql/graphql";
import {
  getTripInformation,
} from "@/lib/attribute";
import { ProductImageWrapper } from "@/ui/atoms/ProductImageWrapper";
import { CheckoutLink } from "@/app/[channel]/(main)/cart/CheckoutLink";
import { updateLineFromCheckout } from "@/actions/";

interface CartProps {
  checkout: CheckoutFragment;
}

export default function CartDetail({ checkout }: CartProps) {
  const [showPassengers, setShowPassengers] = useState(false);
  const initialQty = checkout.lines?.[0]?.quantity ?? 1;
  const [passengerCount, setPassengerCount] = useState<number>(initialQty);
  const [price, setPrice] = useState<MoneyFragment>(checkout.totalPrice.gross);

  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<CheckoutErrorFragment[] | null>(null);

  // ✅ Extract variant attributes
  const departLine = checkout.lines?.[0];
  const variant = departLine?.variant;
  const attributes = variant?.attributes || [];

  const {departureCity,departureStation,arrivalCity,arrivalStation,formattedDate,company,departureTimeStr,readableDuration,arrivalTimeStr} = getTripInformation({attributes})

  const amount = price?.amount || 0;
  const currency = price?.currency || "";


  const handleQuantityUpdate = async (newQty: number) => {
    if (!variant?.id || !checkout?.id) return;

    setPassengerCount(newQty);
    setErrors(null);

    startTransition(async () => {
      try {
        const {errors,checkout:checkoutLinesUpdate} = await updateLineFromCheckout({
          checkoutId: checkout.id,
          lines: [
            {
              quantity: newQty,
              variantId: variant.id,
            },
          ],
        });

 
        if (errors && errors.length > 0) {
          setErrors(errors);
          return;
        }
        
        if(checkoutLinesUpdate?.lines?.[0]?.quantity){
          setPassengerCount(checkoutLinesUpdate?.lines?.[0]?.quantity);
         }
         if(checkoutLinesUpdate?.totalPrice){
            setPrice(checkoutLinesUpdate.totalPrice.gross);
           }
        
      } catch (err) {
        console.error("Erreur updateLineFromCheckout:", err);

      }
    });
  };

  const increasePassenger = () =>
    handleQuantityUpdate((passengerCount ?? 1) + 1);

  const decreasePassenger = () =>
    handleQuantityUpdate(passengerCount > 1 ? passengerCount - 1 : 1);

  return (
    <section className="mx-auto max-w-7xl p-8">
      <div className="w-full max-w-3xl mx-auto mt-6 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* Title */}
        <h2 className="text-lg text-gray-800 mb-1">Départ</h2>
        <p className="text-sm text-gray-600 mb-5 uppercase">
          {departureCity} › {arrivalCity} • {formattedDate}
        </p>

        {/* Trip Summary Card */}
        <div className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 mb-6">
          <div>
            {/* Company */}
            <div className="flex items-center gap-2 mb-3">
              {variant?.product?.thumbnail?.url && (
                <ProductImageWrapper
                  src={variant.product.thumbnail.url}
                  alt={variant.product.thumbnail?.alt ?? ""}
                  width={140}
                  height={40}
                  className="w-[70px] h-[20px]"
                />
              )}
              <span className="text-gray-700 text-sm  ">
                {company ?? "Compagnie inconnue"}
              </span>
            </div>

            {/* Time info */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-lg text-primary">
                  {departureTimeStr}
                </div>
                <div className="text-xs text-gray-500">
                  {departureStation ?? ""}
                </div>
              </div>

              <div className="flex flex-col items-center text-gray-400">
                <div className="text-lg">→</div>
                <div className="text-xs text-gray-500 mt-1">
                  {readableDuration}
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg text-primary">
                  {arrivalTimeStr ?? "— —"}
                </div>
                <div className="text-xs text-gray-500">
                  {arrivalStation ?? ""}
                </div>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-right mt-4 md:mt-0">
            <div className="text-xl text-[#d13b3b]">
              {formatMoney(amount, currency)}
            </div>
          </div>
        </div>

        {/* Add Traveler Section */}
        <div className="border border-gray-200 rounded-xl p-4 mb-6">
          <button
            onClick={() => setShowPassengers((v) => !v)}
            className="w-full flex justify-between items-center text-gray-700  "
          >
            <span>Ajouter un voyageur</span>
            {showPassengers ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {showPassengers && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-gray-700  ">Passagers</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={decreasePassenger}
                  disabled={isPending}
                  className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-gray-800">
                  {passengerCount}
                </span>
                <button
                  onClick={increasePassenger}
                  disabled={isPending}
                  className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
          {/* show errors if any */}
          {errors && errors.length > 0 && (
            <div className="mt-3 text-sm text-red-600">
              {errors.map((e, idx) => (
                <div key={idx}>{e.message || "Erreur inconnue"}</div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-end gap-4">
          <button className="bg-white border border-gray-300 text-gray-700 py-2 px-5 rounded-md hover:bg-gray-100 transition">
            Ajouter un retour
          </button>

          <CheckoutLink
            checkoutId={checkout.id}
            disabled={!checkout.lines.length || isPending}
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-green-700 transition"
          />
        </div>
      </div>
    </section>
  );
}
