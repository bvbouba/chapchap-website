import { useEffect, useMemo } from "react";

import { type Checkout, LanguageCodeEnum, useCheckoutQuery } from "@/checkout/graphql";
import { extractCheckoutIdFromUrl } from "@/checkout/lib/utils/url";
import { useCheckoutUpdateStateActions } from "@/checkout/state/updateStateStore";

export const useCheckout = ({ pause = false } = {}) => {
	const id = useMemo(() => extractCheckoutIdFromUrl(), []);
	const { setLoadingCheckout } = useCheckoutUpdateStateActions();
	const shouldPause = pause || !id;

	const [{ data, fetching, stale }, refetch] = useCheckoutQuery({
		variables: { id: id || "", languageCode: LanguageCodeEnum.Fr },
		pause: shouldPause,
	});

	useEffect(() => setLoadingCheckout(fetching || stale), [fetching, setLoadingCheckout, stale]);

	return useMemo(
		() => ({
			checkout: data?.checkout as Checkout,
			fetching: shouldPause ? false : fetching || stale,
			refetch,
			checkoutId: id,
		}),
		[data?.checkout, fetching, refetch, stale, id, shouldPause],
	);
};
