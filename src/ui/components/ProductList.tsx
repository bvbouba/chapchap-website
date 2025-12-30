import { ProductElement } from "./ProductElement";
import { type ProductVariantListItemFragment } from "@/gql/graphql";

export const ProductList = ({ variants }: { variants: readonly ProductVariantListItemFragment[] }) => {
	return (
		<>
			{variants.map((variant, index) => (
				<ProductElement
					key={variant.id}
					variant={variant}
					priority={index < 2}
					loading={index < 3 ? "eager" : "lazy"}
				/>
			))}
		</>
	);
};
