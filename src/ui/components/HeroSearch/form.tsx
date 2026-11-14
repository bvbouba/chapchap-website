"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { MapPin, Calendar, ArrowUpDown, ArrowLeftRight, Search, Bus } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { type citiesType } from "./HeroSearch";
import { type TripSearchData } from "@/context/TripSearchContext";
import { type AssignedAttributeValueFragment } from "@/gql/graphql";
import { useSessionTimer } from "@/context/SessionTimerContext";

export type FormValues = {
	origin: { id: string; name: string; slug: string };
	destination: { id: string; name: string; slug: string };
	date: string;
	returnDate: string;
};

type DateChipKind = "today" | "tomorrow" | "other";

interface TripSearchFormProps {
	onSubmit: (values: FormValues & { tripType: "oneway" | "roundtrip" }) => Promise<void> | void;
	initialTripType?: "oneway" | "roundtrip";
	data?: TripSearchData | null;
	cities: citiesType;
	isPending?: boolean;
	/** Compact sticky layout for trips results page */
	compact?: boolean;
}

function startOfDay(value: Date): Date {
	return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number): Date {
	const next = startOfDay(value);
	next.setDate(next.getDate() + days);
	return next;
}

function formatLocalDateKey(value: Date): string {
	const y = value.getFullYear();
	const m = `${value.getMonth() + 1}`.padStart(2, "0");
	const d = `${value.getDate()}`.padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function parseLocalDateKey(key: string): Date {
	const [y, m, d] = key.split("-").map(Number);
	return new Date(y, (m || 1) - 1, d || 1);
}

/** Hero search chip label: short weekday + day + long month (month lowercase). */
function formatFrenchHeroTripDate(value: Date): string {
	const weekday = value.toLocaleDateString("fr-FR", { weekday: "short" });
	const dayNum = value.getDate();
	const monthLong = value.toLocaleDateString("fr-FR", { month: "long" }).toLowerCase();
	const weekdayFormatted = weekday.charAt(0).toUpperCase() + weekday.slice(1).toLowerCase();
	return `${weekdayFormatted} ${dayNum} ${monthLong}`;
}

export const TripSearchForm = ({
	onSubmit,
	data,
	initialTripType = "oneway",
	cities,
	isPending,
	compact = false,
}: TripSearchFormProps) => {
	const [tripType] = useState<"oneway" | "roundtrip">(initialTripType);
	const { departureCities, arrivalCities } = cities;

	const [originSuggestions, setOriginSuggestions] = useState<AssignedAttributeValueFragment[]>([]);
	const [destinationSuggestions, setDestinationSuggestions] = useState<AssignedAttributeValueFragment[]>([]);
	const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
	const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

	const [originDisplay, setOriginDisplay] = useState("");
	const [destinationDisplay, setDestinationDisplay] = useState("");
	const [originSlug, setOriginSlug] = useState("");
	const [destinationSlug, setDestinationSlug] = useState("");

	const originRef = useRef<HTMLDivElement>(null);
	const destinationRef = useRef<HTMLDivElement>(null);
	const otherDateInputRef = useRef<HTMLInputElement>(null);

	const todayDate = useMemo(() => startOfDay(new Date()), []);
	const tomorrowDate = useMemo(() => addDays(todayDate, 1), [todayDate]);
	const today = formatLocalDateKey(todayDate);
	const tomorrow = formatLocalDateKey(tomorrowDate);

	const { resetTimer } = useSessionTimer();

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				originRef.current &&
				!originRef.current.contains(e.target as Node) &&
				destinationRef.current &&
				!destinationRef.current.contains(e.target as Node)
			) {
				setShowOriginSuggestions(false);
				setShowDestinationSuggestions(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const formik = useFormik({
		initialValues: { origin: "", destination: "", date: today, returnDate: "" },
		validationSchema: Yup.object({
			origin: Yup.string().required("Veuillez saisir une ville"),
			destination: Yup.string().required("Veuillez saisir une ville"),
			date: Yup.string().required("Veuillez sélectionner une date"),
		}),
		onSubmit: async (values, { setSubmitting }) => {
			try {
				const payload = {
					...values,
					tripType,
					origin: { id: values.origin, name: originDisplay, slug: originSlug },
					destination: { id: values.destination, name: destinationDisplay, slug: destinationSlug },
				};

				if (onSubmit) {
					await onSubmit(payload);
				}
			} catch (error) {
				console.error("Erreur lors de la soumission:", error);
			} finally {
				resetTimer();
				setSubmitting(false);
			}
		},
	});

	const activeChip: DateChipKind =
		formik.values.date === today ? "today" : formik.values.date === tomorrow ? "tomorrow" : "other";

	useEffect(() => {
		const query = originDisplay.trim().toLowerCase();
		const filtered = departureCities.filter(
			(c) => (!query || c.name?.toLowerCase().includes(query)) && c.slug !== destinationSlug,
		);
		setOriginSuggestions(filtered.slice(0, 10));
	}, [originDisplay, departureCities, destinationSlug]);

	useEffect(() => {
		const query = destinationDisplay.trim().toLowerCase();
		const filtered = arrivalCities.filter(
			(c) => (!query || c.name?.toLowerCase().includes(query)) && c.slug !== originSlug,
		);
		setDestinationSuggestions(filtered.slice(0, 10));
	}, [destinationDisplay, arrivalCities, originSlug]);

	useEffect(() => {
		if (data) {
			void formik.setValues({
				origin: data.origin.id,
				destination: data.destination.id,
				date: data.date || today,
				returnDate: data.returnDate || "",
			});
			setOriginDisplay(data.origin.name);
			setDestinationDisplay(data.destination.name);
			setOriginSlug(data.origin.slug || "");
			setDestinationSlug(data.destination.slug || "");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, today]);

	const handleSelect = (city: AssignedAttributeValueFragment, type: "departure" | "arrival") => {
		if (type === "departure") {
			void formik.setFieldValue("origin", city.id);
			setOriginDisplay(city.name || "");
			setOriginSlug(city.slug || "");
			setShowOriginSuggestions(false);
		} else {
			void formik.setFieldValue("destination", city.id);
			setDestinationDisplay(city.name || "");
			setDestinationSlug(city.slug || "");
			setShowDestinationSuggestions(false);
		}
	};

	const handleSwitch = () => {
		const tempDisp = originDisplay;
		setOriginDisplay(destinationDisplay);
		setDestinationDisplay(tempDisp);
		const tempSlug = originSlug;
		setOriginSlug(destinationSlug);
		setDestinationSlug(tempSlug);
		const tempId = formik.values.origin;
		void formik.setFieldValue("origin", formik.values.destination);
		void formik.setFieldValue("destination", tempId);
	};

	const openOtherDatePicker = () => {
		const input = otherDateInputRef.current;
		if (!input) return;
		try {
			if (typeof input.showPicker === "function") {
				input.showPicker();
				return;
			}
		} catch {
			// Fall through to click fallback when showPicker is blocked.
		}
		input.focus();
		input.click();
	};

	const chipClass = (active: boolean) =>
		[
			compact
				? "inline-flex h-9 items-center justify-center rounded-full border px-3 text-xs transition"
				: "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm transition",
			active
				? "border-[#EB1700] bg-[#EB1700] font-semibold text-white shadow-sm"
				: "border-[#E2E3E7] bg-white font-medium text-[#505050] hover:border-[#C8C9CE] hover:bg-[#F7F7F8]",
		].join(" ");

	const fieldError = (name: "origin" | "destination" | "date") =>
		formik.touched[name] && formik.errors[name] ? (
			<p className="mt-1 text-xs text-[#EB1700]">{formik.errors[name]}</p>
		) : null;

	const inputHeight = compact ? "h-11" : "h-[52px]";
	const inputClass = `${inputHeight} w-full rounded-[14px] border border-[#E2E3E7] bg-[#F7F7F8] py-2 pl-11 pr-4 text-sm text-[#111111] placeholder:font-normal placeholder:text-[#9CA3AF] focus:border-[#EB1700] focus:outline-none focus:ring-1 focus:ring-[#EB1700] sm:text-base`;

	return (
		<form onSubmit={formik.handleSubmit} className="flex w-full flex-col gap-1">
			<div
				className={
					compact
						? "grid gap-2 lg:grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)_minmax(240px,auto)_180px] lg:items-end"
						: "grid gap-2 lg:grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)_minmax(280px,auto)_220px] lg:items-start"
				}
			>
				<div ref={originRef} className="relative flex-1">
					{!compact ? (
						<label className="mb-1.5 ml-0.5 block text-xs text-[#606060]">Ville de départ</label>
					) : (
						<label className="sr-only">Ville de départ</label>
					)}
					<div className="relative">
						<Bus
							className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
								originDisplay ? "text-[#EB1700]" : "text-[#9CA3AF]"
							}`}
						/>
						<input
							type="text"
							placeholder="Départ"
							value={originDisplay}
							onChange={(e) => {
								setOriginDisplay(e.target.value);
								void formik.setFieldValue("origin", "");
								setOriginSlug("");
							}}
							onBlur={() => void formik.setFieldTouched("origin", true)}
							onFocus={() => setShowOriginSuggestions(true)}
							className={inputClass}
							autoComplete="off"
						/>
					</div>
					{fieldError("origin")}
					{showOriginSuggestions && originSuggestions.length > 0 && (
						<ul className="absolute z-40 mt-1 max-h-48 w-full overflow-y-auto rounded-[14px] border border-[#E2E3E7] bg-white shadow-md">
							{originSuggestions.map((city) => (
								<li
									key={city.id}
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => handleSelect(city, "departure")}
									className="cursor-pointer px-3 py-2.5 text-sm hover:bg-[#F7F7F8]"
								>
									{city.name}
								</li>
							))}
						</ul>
					)}
				</div>

				<div className={`flex items-center justify-center ${compact ? "lg:pb-0.5" : "py-1 lg:pt-[30px]"}`}>
					<button
						type="button"
						onClick={handleSwitch}
						aria-label="Permuter départ et destination"
						className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E3E7] bg-white shadow-sm transition hover:border-[#EB1700]"
					>
						<ArrowUpDown className="h-5 w-5 text-[#EB1700] lg:hidden" />
						<ArrowLeftRight className="hidden h-5 w-5 text-[#EB1700] lg:block" />
					</button>
				</div>

				<div ref={destinationRef} className="relative flex-1">
					{!compact ? (
						<label className="mb-1.5 ml-0.5 block text-xs text-[#606060]">Ville de destination</label>
					) : (
						<label className="sr-only">Ville de destination</label>
					)}
					<div className="relative">
						<MapPin
							className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
								destinationDisplay ? "text-[#EB1700]" : "text-[#9CA3AF]"
							}`}
						/>
						<input
							type="text"
							placeholder="Destination"
							value={destinationDisplay}
							onChange={(e) => {
								setDestinationDisplay(e.target.value);
								void formik.setFieldValue("destination", "");
								setDestinationSlug("");
							}}
							onBlur={() => void formik.setFieldTouched("destination", true)}
							onFocus={() => setShowDestinationSuggestions(true)}
							className={inputClass}
							autoComplete="off"
						/>
					</div>
					{fieldError("destination")}
					{showDestinationSuggestions && destinationSuggestions.length > 0 && (
						<ul className="absolute z-40 mt-1 max-h-48 w-full overflow-y-auto rounded-[14px] border border-[#E2E3E7] bg-white shadow-md">
							{destinationSuggestions.map((city) => (
								<li
									key={city.id}
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => handleSelect(city, "arrival")}
									className="cursor-pointer px-3 py-2.5 text-sm hover:bg-[#F7F7F8]"
								>
									{city.name}
								</li>
							))}
						</ul>
					)}
				</div>

				<div className={compact ? "" : "mt-3 lg:mt-0"}>
					{!compact ? (
						<label className="mb-1.5 ml-0.5 block text-xs text-[#606060]">Date de voyage</label>
					) : (
						<label className="sr-only">Date de voyage</label>
					)}
					<div className={`flex flex-wrap items-center gap-2 ${compact ? "min-h-11" : "min-h-[52px]"}`}>
						<button
							type="button"
							className={chipClass(activeChip === "today")}
							aria-pressed={activeChip === "today"}
							onClick={() => void formik.setFieldValue("date", today)}
						>
							Aujourd&apos;hui
						</button>
						<button
							type="button"
							className={chipClass(activeChip === "tomorrow")}
							aria-pressed={activeChip === "tomorrow"}
							onClick={() => void formik.setFieldValue("date", tomorrow)}
						>
							Demain
						</button>
						<button
							type="button"
							className={chipClass(activeChip === "other")}
							aria-pressed={activeChip === "other"}
							onClick={openOtherDatePicker}
						>
							<Calendar
								className={`mr-1.5 h-3.5 w-3.5 ${
									activeChip === "other" ? "text-white" : "text-[#9CA3AF]"
								}`}
								aria-hidden
							/>
							{activeChip === "other"
								? formatFrenchHeroTripDate(parseLocalDateKey(formik.values.date))
								: "Autre date"}
						</button>
						<input
							ref={otherDateInputRef}
							type="date"
							name="date"
							min={today}
							value={formik.values.date}
							onChange={(e) => {
								void formik.setFieldValue("date", e.target.value);
								void formik.setFieldTouched("date", true);
							}}
							className="sr-only"
							tabIndex={-1}
							aria-hidden
						/>
					</div>
					{fieldError("date")}
				</div>

				<button
					type="submit"
					disabled={formik.isSubmitting || isPending}
					className={`flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-[14px] bg-[#EB1700] px-4 font-bold text-white transition hover:bg-[#c91400] disabled:bg-gray-400 ${
						compact
							? "mt-1 h-11 text-sm lg:mt-0"
							: "mt-3 h-[54px] text-base lg:mt-[22px]"
					}`}
				>
					<Search className="h-5 w-5" />
					{isPending ? "Recherche..." : compact ? "Rechercher" : "Rechercher un bus"}
				</button>
			</div>
		</form>
	);
};
