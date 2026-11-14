"use client";

import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTripSearch } from "@/context/TripSearchContext";

dayjs.locale("fr");

type Props = {
	originName: string;
	destinationName: string;
	tripCount?: number | null;
};

export function ResultsDateTabs({ originName, destinationName, tripCount }: Props) {
	const { data, setData } = useTripSearch();
	const router = useRouter();
	const params = useParams<{ channel: string }>();
	const today = useMemo(() => dayjs().startOf("day"), []);

	const selected = useMemo(() => {
		const raw = data?.date || data?.query?.date;
		const parsed = raw ? dayjs(raw) : today;
		return parsed.isValid() && !parsed.isBefore(today, "day") ? parsed.startOf("day") : today;
	}, [data?.date, data?.query?.date, today]);

	const [windowStart, setWindowStart] = useState(today);

	useEffect(() => {
		const diff = selected.diff(today, "day");
		const startOffset = Math.max(0, Math.min(diff - 2, 14));
		setWindowStart(today.add(startOffset, "day"));
	}, [selected, today]);

	const days = useMemo(
		() => Array.from({ length: 7 }, (_, i) => windowStart.add(i, "day")),
		[windowStart],
	);

	const selectDate = (next: dayjs.Dayjs) => {
		if (next.isBefore(today, "day") || !data) return;
		const dateStr = next.format("YYYY-MM-DD");
		setData({
			...data,
			date: dateStr,
			query: {
				origin: data.origin.slug ?? data.query?.origin ?? "",
				destination: data.destination.slug ?? data.query?.destination ?? "",
				date: dateStr,
			},
		});

		const channel = Array.isArray(params.channel) ? params.channel[0] : params.channel;
		if (channel && data.origin.id && data.destination.id) {
			router.replace(
				`/${channel}/trips/${data.origin.id}/${data.destination.id}?date=${dateStr}`,
				{ scroll: false },
			);
		}
	};

	const countLabel =
		typeof tripCount === "number"
			? tripCount === 0
				? "Aucun trajet"
				: `${tripCount} trajet${tripCount > 1 ? "s" : ""}`
			: null;

	return (
		<div className="border-b border-[#E8E9EC] bg-white">
			<div className="mx-auto max-w-6xl px-4 py-3 sm:px-8">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<p className="text-sm text-[#505050]">
						{countLabel ? (
							<>
								<span className="font-semibold text-[#111111]">{countLabel}</span>
								{" de "}
							</>
						) : (
							"Trajets de "
						)}
						<span className="font-semibold text-[#111111]">{originName}</span>
						{" vers "}
						<span className="font-semibold text-[#111111]">{destinationName}</span>
					</p>
				</div>

				<div className="mt-3 flex items-center gap-2">
					<button
						type="button"
						aria-label="Jours précédents"
						disabled={windowStart.isSame(today, "day")}
						onClick={() => setWindowStart((d) => d.subtract(3, "day").isBefore(today) ? today : d.subtract(3, "day"))}
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E2E3E7] bg-white text-[#505050] transition hover:bg-[#F7F7F8] disabled:cursor-not-allowed disabled:opacity-40"
					>
						<ChevronLeft className="h-4 w-4" />
					</button>

					<div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
						{days.map((d) => {
							const isSelected = d.isSame(selected, "day");
							const isToday = d.isSame(today, "day");
							return (
								<button
									key={d.format("YYYY-MM-DD")}
									type="button"
									onClick={() => selectDate(d)}
									className={[
										"min-w-[4.75rem] shrink-0 rounded-xl border px-3 py-2 text-center transition",
										isSelected
											? "border-[#A6C65A] bg-[#A6C65A] text-white shadow-sm"
											: "border-[#E2E3E7] bg-white text-[#303030] hover:border-[#C8C9CE] hover:bg-[#F7F7F8]",
									].join(" ")}
								>
									<div className={`text-xs capitalize ${isSelected ? "text-white/90" : "text-[#606060]"}`}>
										{isToday ? "Aujourd'hui" : d.format("ddd")}
									</div>
									<div className="mt-0.5 text-sm font-semibold">{d.format("D MMM")}</div>
								</button>
							);
						})}
					</div>

					<button
						type="button"
						aria-label="Jours suivants"
						onClick={() => setWindowStart((d) => d.add(3, "day"))}
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E2E3E7] bg-white text-[#505050] transition hover:bg-[#F7F7F8]"
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
