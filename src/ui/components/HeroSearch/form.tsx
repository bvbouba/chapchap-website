"use client";

import { AssignedAttributeValueFragment } from "@/gql/graphql";
import { useState, useEffect, useRef } from "react";
import { MapPin, Calendar, ArrowLeftRight } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TripSearchData, useTripSearch } from "@/context/TripSearchContext";
import { TripSearchFormSkeleton } from "./skeleton";
import { useProgress } from "@/context/ProgressContext";
import { citiesType } from "./HeroSearch";

export type FormValues = {
	origin: {
		id: string;
		name: string;
		slug: string;
	};
	destination: {
		id: string;
		name: string;
		slug: string;
	};
	date: string; // ISO yyyy-mm-dd
	returnDate: string; // ISO yyyy-mm-dd or ""
};

interface TripSearchFormProps {
	onSubmit: (values: FormValues & { tripType: "oneway" | "roundtrip" }) => void;
	initialTripType?: "oneway" | "roundtrip";
	data?: TripSearchData | null;
	cities : citiesType
}

export default function TripSearchForm({ onSubmit, data, initialTripType = "oneway",cities }: TripSearchFormProps) {
	const [tripType, setTripType] = useState<"oneway" | "roundtrip">(initialTripType);
    const {departureCities, arrivalCities} = cities
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
	const today = new Date().toISOString().split("T")[0];
	const { setData } = useTripSearch();
	const { setStep } = useProgress();


	// ✅ Close suggestions when clicking outside
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

	// ✅ Formik setup
	const formik = useFormik({
		initialValues: {
			origin: "",
			destination: "",
			date: today,
			returnDate: "",
		},
		validationSchema: Yup.object({
			origin: Yup.string().required("Veuillez saisir une ville"),
			destination: Yup.string().required("Veuillez saisir une ville"),
			date: Yup.string().required("Veuillez sélectionner une date"),
			returnDate: Yup.string().when([], {
				is: () => tripType === "roundtrip",
				then: (schema) => schema.required("Veuillez sélectionner une date"),
			}),
		}),
		onSubmit: (values) => {
			const payload = {
				...values,
				tripType,
				origin: {
					id: values.origin,
					name: originDisplay,
					slug: originSlug,
				},
				destination: {
					id: values.destination,
					name: destinationDisplay,
					slug: destinationSlug,
				},
			};

			if (onSubmit) {
				setData({
					...payload,
					query: {
						origin: values.origin,
						destination: values.destination,
						date: values.date,
					},
				});
				setStep("depart");
				onSubmit(payload);
			} else {
				console.log(payload);
			}
		},
	});

	// ✅ Suggestions filtering
	useEffect(() => {
		if (formik.values.origin.length >= 2) {
			const filtered = departureCities.filter(
				(c) => c.name?.toLowerCase().includes(formik.values.origin.toLowerCase()),
			);
			setOriginSuggestions(filtered.slice(0, 10));
		}
	}, [formik.values.origin, departureCities]);

	useEffect(() => {
		if (formik.values.destination.length >= 2) {
			const filtered = arrivalCities.filter(
				(c) => c.name?.toLowerCase().includes(formik.values.destination.toLowerCase()),
			);
			setDestinationSuggestions(filtered.slice(0, 10));
		}
	}, [formik.values.destination, arrivalCities]);

	// ✅ Pre-fill form if data exists
	useEffect(() => {
		if (data) {
			formik.setValues({
				origin: data.origin.id,
				destination: data.destination.id,
				date: data.date || today,
				returnDate: data.returnDate || "",
			});

			setOriginDisplay(data.origin.name);
			setDestinationDisplay(data.destination.name);
			setOriginSlug(data.origin.slug || "");
			setDestinationSlug(data.destination.slug || "");
			setTripType(data.tripType);
		}
	}, [data]);

	const handleSelect = (city: AssignedAttributeValueFragment, type: "departure" | "arrival") => {
		if (type === "departure") {
			formik.setFieldValue("origin", city.id);
			setOriginDisplay(city.name || "");
			setOriginSlug(city.slug || ""); // ✅ store slug
			setShowOriginSuggestions(false);
		} else {
			formik.setFieldValue("destination", city.id);
			setDestinationDisplay(city.name || "");
			setDestinationSlug(city.slug || ""); // ✅ store slug
			setShowDestinationSuggestions(false);
		}
	};

	const handleSwitch = () => {
		// Swap visible names
		const tempDisplay = originDisplay;
		setOriginDisplay(destinationDisplay);
		setDestinationDisplay(tempDisplay);

		// Swap slugs
		const tempSlug = originSlug;
		setOriginSlug(destinationSlug);
		setDestinationSlug(tempSlug);

		// Swap form values (IDs)
		const tempOriginId = formik.values.origin;
		formik.setFieldValue("origin", formik.values.destination);
		formik.setFieldValue("destination", tempOriginId);
	};

	// ✅ Show skeleton while loading
	// if (loading) {
	// 	return <TripSearchFormSkeleton />;
	// }

	return (
		<>
			{/* Trip type toggle */}
			<div className="mb-6 flex items-center gap-6">
				<label className="flex cursor-pointer items-center gap-2">
					<input
						type="radio"
						name="tripType"
						value="oneway"
						checked={tripType === "oneway"}
						onChange={() => {
							setTripType("oneway");
							formik.setFieldValue("returnDate", "");
						}}
						className="h-4 w-4 border-gray-300 bg-gray-100 text-primary focus:ring-primary dark:ring-offset-gray-800 dark:focus:ring-primary "
					/>
					<span className="text-sm">Aller simple</span>
				</label>
				{/* <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="roundtrip"
                checked={tripType === "roundtrip"}
                onChange={() => setTripType("roundtrip")}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800"
              />
              <span className="text-sm">Aller-retour</span>
            </label> */}
			</div>

			{/* Form */}
			<form
				onSubmit={formik.handleSubmit}
				className={`grid w-full items-start gap-3 sm:gap-4 ${
					tripType === "roundtrip"
						? "md:grid-cols-[repeat(24,_minmax(0,_1fr))]"
						: "md:grid-cols-[repeat(19,_minmax(0,_1fr))]"
				}`}
			>
				{/* Origin */}
				<div ref={originRef} className="relative col-span-1 md:col-span-5">
					<MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
					<input
						name="origin"
						type="text"
						placeholder="De: ville"
						value={originDisplay}
						onChange={(e) => {
							setOriginDisplay(e.target.value);
							formik.setFieldValue("origin", e.target.value);
						}}
						onFocus={() => setShowOriginSuggestions(true)}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck="false"
						className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-800 focus:border-gray-400 focus:ring-gray-400"
					/>
					{showOriginSuggestions && originSuggestions.length > 0 && (
						<ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-md">
							{originSuggestions.map((city) => (
								<li
									key={city.id}
									onClick={() => handleSelect(city, "departure")}
									className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
								>
									{city.name}
								</li>
							))}
						</ul>
					)}
					{formik.touched.origin && formik.errors.origin && (
						<p className="mt-1 text-xs text-red-500">{formik.errors.origin}</p>
					)}
				</div>

				{/* Switch */}
				<div className="col-span-1 flex items-center justify-center md:col-span-1">
					<button
						type="button"
						onClick={handleSwitch}
						className="rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
						title="Inverser les villes"
					>
						<ArrowLeftRight className="h-5 w-5" />
					</button>
				</div>

				{/* Destination */}
				<div ref={destinationRef} className="relative col-span-1 md:col-span-5">
					<MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
					<input
						name="destination"
						type="text"
						placeholder="À: ville"
						value={destinationDisplay}
						onChange={(e) => {
							setDestinationDisplay(e.target.value);
							formik.setFieldValue("destination", e.target.value);
						}}
						onFocus={() => setShowDestinationSuggestions(true)}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck="false"
						className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-800 focus:border-gray-400 focus:ring-gray-400"
					/>
					{showDestinationSuggestions && destinationSuggestions.length > 0 && (
						<ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-md">
							{destinationSuggestions.map((city) => (
								<li
									key={city.id}
									onClick={() => handleSelect(city, "arrival")}
									className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
								>
									{city.name}
								</li>
							))}
						</ul>
					)}
					{formik.touched.destination && formik.errors.destination && (
						<p className="mt-1 text-xs text-red-500">{formik.errors.destination}</p>
					)}
				</div>

				{/* Dates */}
				<div className={`col-span-1 flex ${tripType === "roundtrip" ? "md:col-span-10" : "md:col-span-5"}`}>
					{/* Departure */}
					<div className={`relative w-full ${tripType === "roundtrip" ? "flex-1" : "w-full"}`}>
						<Calendar
							onClick={() => {
								const input = document.getElementById("date-picker") as HTMLInputElement | null;
								(input as any)?.showPicker?.();
							}}
							className="absolute left-3 top-2.5 h-5 w-5 cursor-pointer text-gray-400"
						/>
						<input
							id="date-picker"
							name="date"
							type="date"
							value={formik.values.date}
							min={today}
							onChange={formik.handleChange}
							className={`py-2 pl-10 pr-4 text-sm ${
								tripType === "roundtrip" ? "rounded-l-md" : "rounded-md"
							} "bg-white w-full cursor-pointer appearance-none border border-gray-300 text-gray-800 focus:border-gray-400 focus:ring-gray-400 [&::-webkit-calendar-picker-indicator]:hidden`}
						/>
						{formik.touched.date && formik.errors.date && (
							<p className="mt-1 text-xs text-red-500">{formik.errors.date}</p>
						)}
					</div>

					{/* Return Date */}
					{tripType === "roundtrip" && (
						<div className="relative flex-1">
							<Calendar
								onClick={() => {
									const input = document.getElementById("return-date") as HTMLInputElement | null;
									if (input) {
										if (!input.value) {
											input.type = "date";
											input.value = formik.values.date;
											formik.setFieldValue("returnDate", formik.values.date);
										}
										input.focus();
										(input as any)?.showPicker?.();
									}
								}}
								className="absolute left-3 top-2.5 h-5 w-5 cursor-pointer text-gray-400"
							/>
							<input
								id="return-date"
								name="returnDate"
								type={formik.values.returnDate ? "date" : "text"}
								placeholder="Retour"
								value={formik.values.returnDate}
								min={formik.values.date}
								onFocus={(e) => {
									e.currentTarget.type = "date";
									if (!formik.values.returnDate) {
										e.currentTarget.value = formik.values.date;
										formik.setFieldValue("returnDate", formik.values.date);
									}
								}}
								onBlur={(e) => {
									if (!formik.values.returnDate) e.currentTarget.type = "text";
								}}
								onChange={formik.handleChange}
								className="w-full cursor-pointer appearance-none rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-800 focus:border-gray-400 focus:ring-gray-400 [&::-webkit-calendar-picker-indicator]:hidden"
							/>
							{formik.touched.returnDate && formik.errors.returnDate && (
								<p className="mt-1 text-xs text-red-500">{formik.errors.returnDate}</p>
							)}
						</div>
					)}
				</div>

				{/* Submit */}
				<div className="col-span-1 flex justify-center md:col-span-3">
					<button
						type="submit"
						className="w-full rounded-md bg-secondary px-3 py-2 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-secondary-dark
            md:w-auto
            "
					>
						Rechercher
					</button>
				</div>
			</form>
		</>
	);
}
