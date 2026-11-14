import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { PageGetBySlugDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { renderEditorJsToHtmlFragments } from "@/lib/renderEditorJsHtml";
import { LegalDocumentPage } from "@/ui/components/legal/LegalDocumentPage";

type LegalPageConfig = {
	cmsSlug: string;
	defaultTitle: string;
	defaultDescription: string;
	eyebrow: string;
	intro: string;
};

async function loadCmsPage(slug: string) {
	return executeGraphQL(PageGetBySlugDocument, {
		variables: { slug },
		revalidate: 60 * 10,
		withAuth: false,
	}).catch((error) => {
		console.error(`PageGetBySlug ${slug} failed:`, error);
		return { page: null };
	});
}

export async function generateLegalMetadata(config: LegalPageConfig): Promise<Metadata> {
	const { page } = await loadCmsPage(config.cmsSlug);
	const title = page?.seoTitle || page?.title || config.defaultTitle;
	return {
		title: `${title} | ChapChap Tickets`,
		description: page?.seoDescription || config.defaultDescription,
	};
}

export async function LegalCmsPage(config: LegalPageConfig) {
	const { page } = await loadCmsPage(config.cmsSlug);
	if (!page) {
		notFound();
	}

	const htmlFragments = renderEditorJsToHtmlFragments(page.content);
	const title = page.title?.trim() || config.defaultTitle;

	return (
		<LegalDocumentPage
			title={title}
			eyebrow={config.eyebrow}
			intro={config.intro}
			htmlFragments={htmlFragments}
		/>
	);
}
