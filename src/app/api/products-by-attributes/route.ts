import { NextResponse } from "next/server";
import { executeGraphQL } from "@/lib/graphql";
import { ProductListByAttributesDocument } from "@/gql/graphql";

interface ProductByAttributesBody {
  originSlug: string;
  destinationSlug: string;
  date: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ProductByAttributesBody;
    const { originSlug, destinationSlug, date } = body;

    if (!originSlug || !destinationSlug || !date) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const data = await executeGraphQL(ProductListByAttributesDocument, {
      variables: {
        departureCity: originSlug,
        arrivalCity: destinationSlug,
        departureDate: {
          gte: `${date}T00:00:00`,
          lte: `${date}T23:59:59`,
        },
        channel: "ci",
      },
      revalidate: 60,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GraphQL API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
