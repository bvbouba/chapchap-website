import { NextResponse } from "next/server";
import { executeGraphQL } from "@/lib/graphql";
import { GetAttributeBySlugDocument } from "@/gql/graphql";
import { mapEdgesToItems } from "@/lib/maps";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "departure" or "arrival"

  if (!type) {
    return NextResponse.json({ error: "Missing type" }, { status: 400 });
  }

  const slug = type === "departure" ? "departure-city" : "arrival-city";

  const data = await executeGraphQL(GetAttributeBySlugDocument, {
    variables: { slug },
  });

  const choices = mapEdgesToItems(data.attribute?.choices)

  return NextResponse.json({ results: choices });
}
