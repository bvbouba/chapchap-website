import xss from "xss";

type EditorBlock = {
	type?: string;
	data?: {
		text?: string;
		level?: number;
		items?: Array<string | { content?: string; items?: unknown[] }>;
		style?: string;
	};
};

function decodeEntities(raw: string): string {
	return raw
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/g, "'")
		.trim();
}

function stripHtmlKeepText(raw: string): string {
	return decodeEntities(
		raw
			.replace(/<br\s*\/?>/gi, "\n")
			.replace(/<\/p>/gi, "\n")
			.replace(/<[^>]+>/g, ""),
	);
}

/** Convert light markdown (**bold**, *italic*) to safe HTML. */
export function inlineMarkdownToHtml(raw: string): string {
	const text = stripHtmlKeepText(raw);
	const withBold = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
	const withItalic = withBold.replace(/(^|[^*])\*(?!\s)(.+?)(?!\s)\*(?!\*)/g, "$1<em>$2</em>");
	return xss(withItalic);
}

function isBulletParagraph(text: string): boolean {
	return /^(\*|-|•)\s+/.test(text.trim());
}

function bulletBody(text: string): string {
	return text.trim().replace(/^(\*|-|•)\s+/, "");
}

function listItemHtml(items: Array<string | { content?: string }>): string {
	const lis = items
		.map((item) => {
			const raw = typeof item === "string" ? item : (item.content ?? "");
			return `<li>${inlineMarkdownToHtml(raw)}</li>`;
		})
		.join("");
	return `<ul>${lis}</ul>`;
}

/**
 * Renders Saleor Editor.js page content as HTML fragments for legal / CMS pages.
 * Groups consecutive bullet-style paragraphs (`* …`) into a single list.
 */
export function renderEditorJsToHtmlFragments(
	content: string | null | undefined,
): string[] {
	if (!content?.trim()) return [];

	let parsed: { blocks?: EditorBlock[] };
	try {
		parsed = JSON.parse(content) as { blocks?: EditorBlock[] };
	} catch {
		return [];
	}

	const fragments: string[] = [];
	let pendingBullets: string[] = [];

	const flushBullets = () => {
		if (pendingBullets.length === 0) return;
		fragments.push(listItemHtml(pendingBullets));
		pendingBullets = [];
	};

	for (const block of parsed.blocks ?? []) {
		const type = (block.type ?? "").toLowerCase();
		const data = block.data ?? {};

		if (type === "header") {
			flushBullets();
			const text = stripHtmlKeepText(data.text ?? "");
			if (!text) continue;
			const level = Math.min(Math.max(data.level ?? 2, 2), 4);
			fragments.push(`<h${level}>${inlineMarkdownToHtml(text)}</h${level}>`);
			continue;
		}

		if (type === "list") {
			flushBullets();
			const items = (data.items ?? []).map((item) =>
				typeof item === "string" ? item : (item.content ?? ""),
			);
			if (items.length) fragments.push(listItemHtml(items));
			continue;
		}

		if (type === "paragraph" || type === "quote") {
			const text = stripHtmlKeepText(data.text ?? "");
			if (!text) continue;
			if (isBulletParagraph(text)) {
				pendingBullets.push(bulletBody(text));
				continue;
			}
			flushBullets();
			const tag = type === "quote" ? "blockquote" : "p";
			fragments.push(`<${tag}>${inlineMarkdownToHtml(text)}</${tag}>`);
			continue;
		}

		flushBullets();
	}

	flushBullets();
	return fragments;
}
