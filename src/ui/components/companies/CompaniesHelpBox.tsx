import Link from "next/link";
import { Lightbulb, MessageCircle } from "lucide-react";
import { whatsappUrlFromE164 } from "@/lib/loadShopContact";

type Props = {
	channel: string;
	phoneDisplay: string;
	phoneE164: string;
};

export function CompaniesHelpBox({ channel, phoneDisplay, phoneE164 }: Props) {
	const prefill =
		"Bonjour ChapChap, je ne trouve pas ma compagnie / mon billet. Pouvez-vous m'aider ?";
	const hasPhone = Boolean(phoneE164);

	return (
		<section className="mx-auto max-w-6xl px-4 pb-14 sm:px-8">
			<div className="rounded-2xl border border-[#E8E9EC] bg-[#FFF8F6] px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-6">
				<div className="flex gap-3">
					<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
						<Lightbulb className="h-5 w-5 text-[#EB1700]" aria-hidden />
					</span>
					<div>
						<p className="font-bold text-[#111111]">
							Vous ne trouvez pas votre compagnie ou votre billet ?
						</p>
						<p className="mt-1 text-sm text-[#505050]">
							Contactez l&apos;assistance ChapChap
							{phoneDisplay ? (
								<>
									{" "}
									par WhatsApp au{" "}
									<span className="font-semibold text-[#303030]">{phoneDisplay}</span>
								</>
							) : null}
							{" · "}
							<Link href={`/${channel}/contactus`} className="font-semibold text-[#EB1700] underline">
								Page contact
							</Link>
						</p>
					</div>
				</div>
				{hasPhone ? (
					<a
						href={whatsappUrlFromE164(phoneE164, prefill)}
						target="_blank"
						rel="noopener noreferrer"
						className="mt-4 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white transition hover:bg-[#1ebe57] sm:mt-0"
					>
						<MessageCircle className="h-4 w-4" aria-hidden />
						WhatsApp
					</a>
				) : null}
			</div>
		</section>
	);
}
