import { type OrderFragment, LanguageCodeEnum, useOrderQuery } from "@/checkout/graphql";
import { getQueryParams } from "@/checkout/lib/utils/url";

export const useOrder = () => {
	const { orderId } = getQueryParams();

	const [{ data, fetching: loading }] = useOrderQuery({
		pause: !orderId,
		variables: { languageCode: LanguageCodeEnum.Fr, id: orderId as string },
	});

	return { order: data?.order as OrderFragment, loading };
};
