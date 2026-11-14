/**
 * Vercel / CI: use committed GraphQL types (SKIP_GRAPHQL_GENERATE=1).
 * Local: regenerate from Saleor schema when NEXT_PUBLIC_SALEOR_API_URL is set.
 */
import { spawnSync } from "node:child_process";

if (process.env.SKIP_GRAPHQL_GENERATE === "1" || process.env.VERCEL === "1") {
	console.log("prebuild: skipping graphql-codegen (using committed src/gql)");
	process.exit(0);
}

const result = spawnSync("pnpm", ["run", "generate"], {
	stdio: "inherit",
	shell: true,
});

process.exit(result.status ?? 1);
