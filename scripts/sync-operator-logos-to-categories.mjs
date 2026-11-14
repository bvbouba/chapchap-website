/**
 * Copy channel logo_url metadata → public category metadata (same slug)
 * so the customer mobile app can resolve logos without SALEOR_APP_TOKEN.
 *
 * Usage (from customer/website):
 *   node --env-file=.env scripts/sync-operator-logos-to-categories.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
	const fromProcess = process.env.SALEOR_APP_TOKEN?.trim();
	const api =
		process.env.NEXT_PUBLIC_SALEOR_API_URL?.trim() ||
		process.env.SALEOR_API_URL?.trim();
	if (fromProcess && api) {
		return { token: fromProcess, api };
	}
	const envPath = resolve(root, ".env");
	if (!existsSync(envPath)) {
		throw new Error("Missing .env and SALEOR_APP_TOKEN / SALEOR API URL");
	}
	const env = Object.fromEntries(
		readFileSync(envPath, "utf8")
			.split("\n")
			.filter((l) => l && !l.startsWith("#") && l.includes("="))
			.map((l) => {
				const i = l.indexOf("=");
				return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
			}),
	);
	const token = (env.SALEOR_APP_TOKEN || "").trim();
	const apiUrl = (
		env.NEXT_PUBLIC_SALEOR_API_URL ||
		env.SALEOR_API_URL ||
		""
	).trim();
	if (!token || !apiUrl) {
		throw new Error("SALEOR_APP_TOKEN and NEXT_PUBLIC_SALEOR_API_URL required");
	}
	return { token, api: apiUrl };
}

const PLATFORM = new Set(["ci", "default-channel", "default"]);

async function gql(api, token, query, variables) {
	const res = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ query, variables }),
	});
	const json = await res.json();
	if (json.errors?.length) {
		throw new Error(json.errors.map((e) => e.message).join("; "));
	}
	return json.data;
}

async function main() {
	const { token, api } = loadEnv();
	const data = await gql(
		api,
		token,
		`{
      channels {
        slug
        name
        isActive
        metadata { key value }
      }
    }`,
	);

	const operators = (data.channels || []).filter((c) => {
		if (!c.isActive || PLATFORM.has(c.slug)) return false;
		const logo = (c.metadata || []).find((m) => m.key === "logo_url")?.value?.trim();
		return Boolean(logo);
	});

	if (!operators.length) {
		console.log("No operator channels with logo_url found.");
		return;
	}

	for (const ch of operators) {
		const logo = (ch.metadata || [])
			.find((m) => m.key === "logo_url")
			.value.trim();
		const display =
			(ch.metadata || []).find((m) => m.key === "display_name")?.value?.trim() ||
			ch.name ||
			ch.slug;

		let cat = await gql(
			api,
			token,
			`query ($slug: String!) { category(slug: $slug) { id slug metadata { key value } } }`,
			{ slug: ch.slug },
		);

		if (!cat.category) {
			const created = await gql(
				api,
				token,
				`mutation ($input: CategoryInput!) {
          categoryCreate(input: $input) {
            category { id slug }
            errors { field message code }
          }
        }`,
				{ input: { name: display, slug: ch.slug } },
			);
			const errs = created.categoryCreate?.errors || [];
			if (errs.length) {
				console.error(ch.slug, "categoryCreate failed:", errs);
				continue;
			}
			cat = { category: created.categoryCreate.category };
			console.log(ch.slug, "created category", cat.category.id);
		}

		const id = cat.category.id;
		const updated = await gql(
			api,
			token,
			`mutation ($id: ID!, $input: [MetadataInput!]!) {
          updateMetadata(id: $id, input: $input) {
            item { ... on Category { id slug metadata { key value } } }
            errors { field message code }
          }
        }`,
			{
				id,
				input: [
					{ key: "logo_url", value: logo },
					{ key: "display_name", value: display },
				],
			},
		);
		const errs = updated.updateMetadata?.errors || [];
		if (errs.length) {
			console.error(ch.slug, "updateMetadata failed:", errs);
			continue;
		}
		const stored = (updated.updateMetadata?.item?.metadata || []).find(
			(m) => m.key === "logo_url",
		)?.value;
		console.log(ch.slug, "ok", stored ? "logo_url set" : "missing after write");
	}
}

main().catch((err) => {
	console.error(err.message || err);
	process.exit(1);
});
