import { jsPDF } from "jspdf";
import type { TicketShareInput } from "./shareTicketMessage";

export type TicketPdfWebInput = TicketShareInput & {
	departureStation?: string | null;
	arrivalStation?: string | null;
	arrivalTimeStr?: string | null;
	tripIdLabel?: string | null;
	totalLabel?: string | null;
};

function qrImageUrl(orderId: string): string {
	return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(orderId)}`;
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		const blob = await res.blob();
		return await new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}

export async function buildTicketPdfBlob(input: TicketPdfWebInput): Promise<Blob> {
	const doc = new jsPDF({ unit: "pt", format: "a4" });
	const margin = 48;
	let y = margin;

	doc.setFillColor(166, 198, 90);
	doc.rect(0, 0, doc.internal.pageSize.getWidth(), 56, "F");
	doc.setTextColor(17, 17, 17);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(16);
	doc.text("ChapChap Tickets — E-billet", margin, 34);

	y = 84;
	doc.setFontSize(11);
	doc.setTextColor(96, 96, 96);
	doc.text((input.company || "Transport").toUpperCase(), margin, y);

	y += 22;
	doc.setTextColor(17, 17, 17);
	doc.setFontSize(18);
	const route =
		input.departureCity && input.arrivalCity
			? `${input.departureCity} ➔ ${input.arrivalCity}`
			: "Trajet";
	doc.text(route, margin, y);

	y += 20;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(11);
	doc.setTextColor(48, 48, 48);

	const dateLine = (() => {
		if (input.departureDateLabel && input.departureTimeStr) {
			return `${input.departureDateLabel} · ${input.departureTimeStr}`;
		}
		return input.departureDateLabel || input.departureTimeStr || "";
	})();
	if (dateLine) {
		doc.text(dateLine, margin, y);
		y += 16;
	}
	if (input.departureStation) {
		doc.text(`Départ : ${input.departureStation}`, margin, y);
		y += 16;
	}
	if (input.arrivalStation) {
		doc.text(`Arrivée : ${input.arrivalStation}`, margin, y);
		y += 16;
	}
	doc.text(`N° Réservation : #${input.orderNumber || input.confirmationCode}`, margin, y);
	y += 16;
	doc.text(`Code : ${input.confirmationCode}`, margin, y);
	y += 16;
	if (input.tripIdLabel) {
		doc.text(`Trajet : ${input.tripIdLabel}`, margin, y);
		y += 16;
	}
	if (input.totalLabel) {
		doc.text(`Total : ${input.totalLabel}`, margin, y);
		y += 16;
	}

	const passengers = input.passengers?.length ? input.passengers : ["Passager"];
	y += 8;
	doc.setFont("helvetica", "bold");
	doc.text("Passagers", margin, y);
	y += 16;
	doc.setFont("helvetica", "normal");
	for (const name of passengers) {
		doc.text(`• ${name}`, margin, y);
		y += 15;
	}

	y += 12;
	const qrData = await loadImageAsDataUrl(qrImageUrl(input.orderId));
	if (qrData) {
		doc.addImage(qrData, "PNG", margin, y, 140, 140);
		doc.setFontSize(10);
		doc.setTextColor(96, 96, 96);
		doc.text("Présentez ce QR code au contrôle", margin + 156, y + 70);
	}

	const blob = doc.output("blob");
	return blob;
}

export async function shareTicketPdfOnWeb(input: TicketPdfWebInput): Promise<void> {
	const blob = await buildTicketPdfBlob(input);
	const fileName = `chapchap-billet-${input.orderNumber || input.confirmationCode}.pdf`;
	const file = new File([blob], fileName, { type: "application/pdf" });

	const canShareFiles =
		typeof navigator !== "undefined" &&
		typeof navigator.share === "function" &&
		typeof navigator.canShare === "function" &&
		navigator.canShare({ files: [file] });

	if (canShareFiles) {
		try {
			await navigator.share({
				files: [file],
				title: "Billet ChapChap Tickets",
				text: "Voici ton billet PDF ChapChap Tickets",
			});
			return;
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
		}
	}

	// Fallback: download the PDF so the user can attach it in WhatsApp
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
