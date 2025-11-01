import { parse } from "graphql";
import { TypedDocumentString } from "@/gql/graphql";

/**
 * Convert a TypedDocumentString into a valid DocumentNode for URQL.
 */
export function toDocumentNode<TData, TVariables>(
  doc: TypedDocumentString<TData, TVariables>
) {
  return parse(doc.toString());
}