"use client";

import dayjs from "dayjs";
import "dayjs/locale/fr"; // ✅ import French locale
import { useState } from "react";
import { useTripSearch } from "@/context/TripSearchContext";

interface UpcomingTripsSectionProps {
	originName: string;
	destinationName: string;
	initialDate: string;
	busOperatorName?: string;
}

export default function UpcomingTripsSection({
	originName,
	destinationName,
	initialDate,
	busOperatorName,
}: UpcomingTripsSectionProps) {
	dayjs.locale("fr"); // ✅ set locale globally

	const today = dayjs();
	const [currentDate, setCurrentDate] = useState(
		dayjs(initialDate).isBefore(today, "day") ? today : dayjs(initialDate),
	);
	const { data, setData } = useTripSearch();

	const handleDateChange = (daysToAdd: number) => {
		const newDate = currentDate.add(daysToAdd, "day");
		if (newDate.isBefore(today, "day")) return; // 🚫 prevent past dates
		setCurrentDate(newDate);
		if (data) {
			setData({
				...data,
				date: newDate.format("YYYY-MM-DD"),
				query: {
					origin: data.origin.slug ?? "",
					destination: data.destination.slug ?? "",
					date: newDate.format("YYYY-MM-DD"),
				},
			});
		}
	};

	// ✅ Show today + next 6 days
	const upcomingDays = Array.from({ length: 7 }, (_, i) => today.add(i, "day"));
	// ✅ Create readable title
	const title = busOperatorName
		? `Horaires des bus ${busOperatorName.toUpperCase()} : ${originName} → ${destinationName}`
		: `Horaires des bus ${originName} → ${destinationName}`;

	return (
		<div className="mx-auto mt-6 w-full max-w-6xl px-4">
			<h2 className="mb-3 text-center text-lg text-gray-800">{title}</h2>

			<div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
				<button
					onClick={() => handleDateChange(-1)}
					disabled={currentDate.isSame(today, "day")}
					className="text-sm   text-gray-600 hover:text-primary disabled:cursor-not-allowed disabled:text-gray-400"
				>
					← Jour précédent
				</button>

				<div className="flex gap-4 overflow-x-auto">
					{upcomingDays.map((d) => {
						const isSelected = d.isSame(currentDate, "day");
						return (
							<button
								key={d.format("YYYY-MM-DD")}
								onClick={() => handleDateChange(d.diff(currentDate, "day"))}
								disabled={d.isBefore(today, "day")}
								className={`min-w-[60px] rounded-md px-3 py-1 text-sm transition ${
									isSelected ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"
								} ${d.isBefore(today, "day") ? "cursor-not-allowed opacity-50" : ""}`}
							>
								<div className="  capitalize">{d.format("ddd")}</div>
								<div className="text-xs text-gray-500">{d.format("D MMM")}</div>
							</button>
						);
					})}
				</div>

				<button onClick={() => handleDateChange(1)} className="text-sm   text-gray-600 hover:text-primary">
					Jour suivant →
				</button>
			</div>
		</div>
	);
}
