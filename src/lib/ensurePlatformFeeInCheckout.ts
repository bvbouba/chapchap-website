export const PLATFORM_FEE_PRODUCT_SLUG = "platform-fee";

type LineLike = {
	id?: string | null;
	quantity?: number | null;
	variant?: {
		id?: string | null;
		product?: { slug?: string | null } | null;
	} | null;
} | null;

export function isPlatformFeeLine(line: LineLike): boolean {
	return line?.variant?.product?.slug === PLATFORM_FEE_PRODUCT_SLUG;
}

/** Trip lines only (excludes ChapChap platform fee). */
export function getTripLines<T extends LineLike>(lines: T[] | null | undefined): NonNullable<T>[] {
	return (lines ?? []).filter((l): l is NonNullable<T> => !!l && !isPlatformFeeLine(l));
}

export function getTripLineQuantity(lines: LineLike[] | null | undefined): number {
	const tripLines = getTripLines(lines);
	return tripLines.reduce((acc, l) => acc + (l.quantity || 0), 0) || 1;
}
