import { NextResponse } from "next/server";
import { executeGraphQL } from "@/lib/graphql";
import {
  OrderDirection,
  ProductVariantWhereInput,
  ProductVariantCollectionDocument,
  ProductVariantSortField,
} from "@/gql/graphql";

interface ProductCollectionBody {
  where?: ProductVariantWhereInput;
  sortBy?: {
    field: ProductVariantSortField;
    direction?: OrderDirection;
  };
  perPage?: number;
  after?: string | null;
  channel:string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ProductCollectionBody;

    const { where, sortBy, perPage = 4, after,channel } = body;

    const result = await executeGraphQL(ProductVariantCollectionDocument, {
      variables: {
        where,
        first: perPage,
        after,
        channel,
        ...(sortBy?.field &&
          sortBy?.direction && {
            sortBy: {
              field: sortBy.field,
              direction: sortBy.direction,
            },
          }),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Erreur dans ProductCollection API:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des produits." },
      { status: 500 }
    );
  }
}