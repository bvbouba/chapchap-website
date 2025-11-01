import { NextResponse } from "next/server";
import { executeGraphQL } from "@/lib/graphql";
import {
  ProductCollectionDocument,
  ProductFilterInput,
  ProductOrderField,
  OrderDirection,
} from "@/gql/graphql";

interface ProductCollectionBody {
  filter?: ProductFilterInput;
  sortBy?: {
    field: ProductOrderField;
    direction?: OrderDirection;
  };
  perPage?: number;
  after?: string | null;
  date:string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ProductCollectionBody;

    const { filter, sortBy, perPage = 4, after,date } = body;

    const result = await executeGraphQL(ProductCollectionDocument, {
      variables: {
        filter,
        first: perPage,
        after,
        departureDate: {
          gte: `${date}T00:00:00`,
          lte: `${date}T23:59:59`,
        },
        channel: "ci",
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