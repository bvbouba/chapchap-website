"use client";

import { useState, useTransition } from "react";
import "dayjs/locale/fr";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { CheckoutErrorFragment, CheckoutFragment, MoneyFragment } from "@/gql/graphql";
import { getTripInformation } from "@/lib/attribute";
import { ProductImageWrapper } from "@/ui/atoms/ProductImageWrapper";
import { CheckoutLink } from "@/app/[channel]/(main)/cart/CheckoutLink";
import { updateLineFromCheckout } from "@/actions/";
import { Arrow, BusIcon } from "../Svg";

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

	const {
		departureCity,
		departureStation,
		arrivalCity,
		arrivalStation,
		formattedDate,
		company,
		departureTimeStr,
		readableDuration,
		arrivalTimeStr,
	} = getTripInformation({ attributes });

	const amount = price?.amount || 0;
	const currency = price?.currency || "";

	const handleQuantityUpdate = async (newQty: number) => {
		if (!variant?.id || !checkout?.id) return;

		setPassengerCount(newQty);
		setErrors(null);

		startTransition(async () => {
			try {
				const { errors, checkout: checkoutLinesUpdate } = await updateLineFromCheckout({
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

				if (checkoutLinesUpdate?.lines?.[0]?.quantity) {
					setPassengerCount(checkoutLinesUpdate?.lines?.[0]?.quantity);
				}
				if (checkoutLinesUpdate?.totalPrice) {
					setPrice(checkoutLinesUpdate.totalPrice.gross);
				}
			} catch (err) {
				console.error("Erreur updateLineFromCheckout:", err);
			}
		});
	};

	const increasePassenger = () => handleQuantityUpdate((passengerCount ?? 1) + 1);

	const decreasePassenger = () => handleQuantityUpdate(passengerCount > 1 ? passengerCount - 1 : 1);

	return (
		<section className="mx-auto max-w-7xl p-8">
			<div className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
				{/* Title */}
				<h2 className="mb-1 text-xl font-semibold text-gray-800">Départ</h2>
				<p className="mb-5 text-xs uppercase text-gray-600">
					{departureCity} › {arrivalCity} • {formattedDate}
				</p>

				{/* Trip Summary Card */}
				<div className="mb-6 flex flex-col items-start justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center">
					<div>
						{/* Company */}
						<div className="mb-3 flex items-center gap-2">
							{variant?.product?.thumbnail?.url && (
								<ProductImageWrapper
									src={variant.product.thumbnail.url}
									alt={variant.product.thumbnail?.alt ?? ""}
									width={140}
									height={40}
									className="h-[20px] w-[70px]"
								/>
							)}
							<span className="text-sm text-gray-700  ">{company ?? "Compagnie inconnue"}</span>
						</div>

						{/* Time info */}
						<div className="flex items-center gap-6">
							<span>
								<BusIcon />
							</span>
							<div className="text-center">
								<div className="text-xl font-semibold">{departureTimeStr}</div>
								<div className="text-xs text-gray-500">{departureStation?.split(",")[0] ?? ""}</div>
							</div>

							<div className="relative flex w-32 items-center justify-center text-gray-400">
								<Arrow />
								<span className="absolute bg-white px-1 text-xs italic text-gray-500">
									{readableDuration}
								</span>
							</div>

							<div className="text-center">
								<div className="text-xl font-semibold">{arrivalTimeStr ?? "— —"}</div>
								<div className="text-xs text-gray-500">{arrivalStation?.split(",")[0] ?? ""}</div>
							</div>
						</div>
					</div>

					{/* Price */}
					<div className="mt-4 text-right md:mt-0">
						<div className="text-xl font-bold">{formatMoney(amount, currency)}</div>
					</div>
				</div>

				{/* Add Traveler Section */}
				<div className="mb-6 rounded-xl border border-gray-200 p-4">
					<button
						onClick={() => setShowPassengers((v) => !v)}
						className="flex w-full items-center justify-between text-gray-700  "
					>
						<span>Ajouter un voyageur</span>
						{showPassengers ? (
							<ChevronUp className="h-5 w-5 text-gray-500" />
						) : (
							<ChevronDown className="h-5 w-5 text-gray-500" />
						)}
					</button>

					{showPassengers && (
						<div className="mt-4 flex items-center justify-between">
							<span className="text-gray-700  ">Passagers</span>
							<div className="flex items-center gap-3">
								<button
									onClick={decreasePassenger}
									disabled={isPending}
									className="rounded-md border border-gray-300 p-1 hover:bg-gray-100 disabled:opacity-50"
								>
									<Minus className="h-4 w-4 text-gray-600" />
								</button>
								<span className="text-gray-800">{passengerCount}</span>
								<button
									onClick={increasePassenger}
									disabled={isPending}
									className="rounded-md border border-gray-300 p-1 hover:bg-gray-100 disabled:opacity-50"
								>
									<Plus className="h-4 w-4 text-gray-600" />
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
				<div className="flex flex-col justify-end gap-4 md:flex-row">
					{/* <button className="rounded-md border border-gray-300 bg-white px-5 py-2 text-gray-700 transition hover:bg-gray-100">
						Ajouter un retour
					</button> */}

					<CheckoutLink
						checkoutId={checkout.id}
						disabled={!checkout.lines.length || isPending}
						isPending={isPending}
						className="rounded-md bg-secondary px-6 py-2 text-white transition hover:bg-secondary-dark"
					/>
				</div>
			</div>
		</section>
	);
}
