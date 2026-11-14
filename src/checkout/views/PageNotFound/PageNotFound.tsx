import { type FallbackProps } from "react-error-boundary";
import { Bus } from "lucide-react";
import { Button } from "@/checkout/components/Button";
import { ErrorContentWrapper } from "@/checkout/components/ErrorContentWrapper";

export const PageNotFound = ({ error }: Partial<FallbackProps>) => {
	console.error(error);

	// eslint-disable-next-line no-restricted-globals
	const goBack = () => history.back();

	return (
		<ErrorContentWrapper>
			<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1F0]">
				<Bus className="h-7 w-7 text-[#EB1700]" aria-hidden />
			</div>
			<p className="text-lg font-bold text-[#111111]">Impossible de charger votre réservation</p>
			<p className="mt-2 text-sm leading-6 text-[#606060]">
				Nous n&apos;avons pas pu récupérer les informations de votre trajet. Cela peut arriver si la
				session a expiré ou si le lien de paiement est incomplet. Retournez à la recherche et
				réessayez.
			</p>
			<div className="mt-4 flex flex-wrap items-center justify-center gap-3">
				<Button
					ariaLabel="Retour"
					onClick={goBack}
					variant="secondary"
					label="Retour"
				/>
				<a
					href="/"
					className="inline-flex h-10 items-center justify-center rounded-xl bg-[#EB1700] px-4 text-sm font-bold text-white hover:bg-[#c91400]"
				>
					Rechercher un trajet
				</a>
			</div>
		</ErrorContentWrapper>
	);
};
