import { ProductVariantListItemFragment } from "./graphql";
import { ProductElement } from "./ProductElement";

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
