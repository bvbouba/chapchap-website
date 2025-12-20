import { type ReactNode } from "react";
import { type CheckoutLineFragment, type OrderLineFragment } from "@/checkout/graphql";
import { getTripInformation } from "@/lib/attribute";

export type SummaryLine = CheckoutLineFragment | OrderLineFragment;

interface SummaryItemProps {
  line: SummaryLine;
  children: ReactNode;
}

export const SummaryItem = ({ line, children }: SummaryItemProps) => {
  const variant = line?.variant;
  const attributes = variant?.attributes || [];

  const {
    formattedDate,
    departureCity,
    arrivalCity,
    readableDuration,
    company,
	departureTimeStr,
	arrivalTimeStr
  } = getTripInformation({ attributes });

  return (
    <li
      key={line.id}
      className="flex border-b py-4 last:border-none"
      data-testid="SummaryItem"
    >
      {/* Passengers */}
      <p className="mb-4 text-sm text-gray-500">
        {line.quantity} passager{line.quantity > 1 ? "s" : ""}
      </p>

      <div className="relative flex flex-1 flex-col justify-between pl-4">
        <div className="flex justify-between justify-items-start gap-4">
          {/* Départ */}
          <div className="mb-4">
            <p className="font-medium uppercase">Départ</p>
            <p className="text-gray-600 capitalize">{formattedDate}</p>
          </div>

          {/* Trajet */}
          <div className="mb-4">
            <p className="font-medium">
              {departureCity} à {arrivalCity}
            </p>
            <p className="text-gray-600">{`${departureTimeStr} - ${arrivalTimeStr} (${readableDuration})`}</p>
            <p className="text-gray-500">{company}</p>
          </div>

          {children}
        </div>
      </div>
    </li>
  );
};
