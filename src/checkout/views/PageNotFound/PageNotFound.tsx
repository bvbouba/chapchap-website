import { type FallbackProps } from "react-error-boundary";
import { SaleorLogo } from "@/checkout/assets/images/SaleorLogo";
import { Button } from "@/checkout/components/Button";
import { ErrorContentWrapper } from "@/checkout/components/ErrorContentWrapper";

export const PageNotFound = ({ error }: Partial<FallbackProps>) => {
	console.error(error);

	// eslint-disable-next-line no-restricted-globals
	const goBack = () => history.back();

	return (
		<ErrorContentWrapper>
			<div className="mb-4 flex w-28 flex-col">
				<SaleorLogo />
			</div>
			<p>
				Nous n&apos;avons pas pu récupérer les informations de votre commande. Retournez à la boutique et
				réessayez.
			</p>
			<Button
				ariaLabel="Retourner à la boutique"
				onClick={goBack}
				variant="secondary"
				label="Retourner à la boutique"
			/>
		</ErrorContentWrapper>
	);
};
