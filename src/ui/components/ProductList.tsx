import { ProductElement } from "./ProductElement";
import { type ProductVariantListItemFragment } from "@/gql/graphql";
import { type OperatorCardMetaMap } from "@/lib/loadOperatorLogoMap";

export const ProductList = ({
	variants,
	operatorMeta = {},
}: {
	variants: readonly ProductVariantListItemFragment[];
	operatorMeta?: OperatorCardMetaMap;
}) => {
	return (
		<ul className="space-y-3">
			{variants.map((variant, index) => (
				<li key={variant.id}>
					<ProductElement
						variant={variant}
						priority={index < 2}
						loading={index < 3 ? "eager" : "lazy"}
						operatorMeta={operatorMeta}
					/>
				</li>
			))}
		</ul>
	);
};
