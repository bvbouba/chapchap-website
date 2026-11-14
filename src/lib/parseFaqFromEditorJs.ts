export type FaqItem = { q: string; a: string };

function stripHtml(raw: string): string {
	return raw
		.replace(/<br\s*\/?>/gi, " ")
		.replace(/<\/p>/gi, " ")
		.replace(/<[^>]+>/g, "")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&quot;/gi, '"')
		.replace(/\s+/g, " ")
		.trim();
}

type EditorBlock = {
	type?: string;
	data?: { text?: string; level?: number };
};

/**
 * Saleor page content (Editor.js JSON): each header is a question,
 * the following paragraph is its answer.
 */
export function parseFaqFromEditorJs(content: string | null | undefined): FaqItem[] {
	if (!content?.trim()) return [];
	let parsed: { blocks?: EditorBlock[] };
	try {
		parsed = JSON.parse(content) as { blocks?: EditorBlock[] };
	} catch {
		return [];
	}

	const faqs: FaqItem[] = [];
	let pendingQuestion: string | null = null;

	for (const block of parsed.blocks ?? []) {
		const type = (block.type ?? "").toLowerCase();
		const text = stripHtml(block.data?.text ?? "");
		if (!text) continue;

		if (type === "header") {
			pendingQuestion = text;
			continue;
		}

		if (
			pendingQuestion &&
			(type === "paragraph" || type === "list" || type === "quote")
		) {
			faqs.push({ q: pendingQuestion, a: text });
			pendingQuestion = null;
		}
	}

	return faqs;
}
