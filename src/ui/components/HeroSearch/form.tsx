"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Calendar, ArrowLeftRight } from "lucide-react";
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

interface TripSearchFormProps {
	// ✅ Correction du type : permet à onSubmit d'être asynchrone (Promise<void> | void)
	onSubmit: (values: FormValues & { tripType: "oneway" | "roundtrip" }) => Promise<void> | void;
	initialTripType?: "oneway" | "roundtrip";
	data?: TripSearchData | null;
	cities: citiesType;
	isPending?: boolean;
}

export const TripSearchForm = ({
	onSubmit,
	data,
	initialTripType = "oneway",
	cities,
	isPending,
}: TripSearchFormProps) => {
	const [tripType, setTripType] = useState<"oneway" | "roundtrip">(initialTripType);
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
	const today = new Date().toISOString().split("T")[0];
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
					// ✅ L'erreur "Unexpected await of a non-Promise" est résolue par le changement de type ci-dessus
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

	useEffect(() => {
		if (originDisplay.length >= 2) {
			const filtered = departureCities.filter(
				(c) => c.name?.toLowerCase().includes(originDisplay.toLowerCase()),
			);
			setOriginSuggestions(filtered.slice(0, 10));
		} else {
			setOriginSuggestions([]);
		}
	}, [originDisplay, departureCities]);

	useEffect(() => {
		if (destinationDisplay.length >= 2) {
			const filtered = arrivalCities.filter(
				(c) => c.name?.toLowerCase().includes(destinationDisplay.toLowerCase()),
			);
			setDestinationSuggestions(filtered.slice(0, 10));
		} else {
			setDestinationSuggestions([]);
		}
	}, [destinationDisplay, arrivalCities]);

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
			setTripType(data.tripType);
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

	return (
		<>
			<div className="mb-6 flex items-center gap-6">
				<label className="flex cursor-pointer items-center gap-2">
					<input
						type="radio"
						checked={tripType === "oneway"}
						onChange={() => {
							setTripType("oneway");
							void formik.setFieldValue("returnDate", "");
						}}
						className="h-4 w-4 text-primary focus:ring-primary"
					/>
					<span className="text-sm">Aller simple</span>
				</label>
			</div>

			<form
				onSubmit={formik.handleSubmit}
				className="grid w-full items-start gap-3 sm:gap-4 md:grid-cols-[repeat(19,_minmax(0,_1fr))]"
			>
				<div ref={originRef} className="relative col-span-1 md:col-span-5">
					<MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
					<input
						type="text"
						placeholder="De: ville"
						value={originDisplay}
						onChange={(e) => setOriginDisplay(e.target.value)}
						onFocus={() => setShowOriginSuggestions(true)}
						className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm"
						autoComplete="off"
					/>
					{showOriginSuggestions && originSuggestions.length > 0 && (
						<ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white shadow-md">
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
				</div>

				<div className="col-span-1 flex items-center justify-center md:col-span-1">
					<button type="button" onClick={handleSwitch} className="rounded-full bg-gray-100 p-2">
						<ArrowLeftRight className="h-5 w-5" />
					</button>
				</div>

				<div ref={destinationRef} className="relative col-span-1 md:col-span-5">
					<MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
					<input
						type="text"
						placeholder="À: ville"
						value={destinationDisplay}
						onChange={(e) => setDestinationDisplay(e.target.value)}
						onFocus={() => setShowDestinationSuggestions(true)}
						className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm"
						autoComplete="off"
					/>
					{showDestinationSuggestions && destinationSuggestions.length > 0 && (
						<ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white shadow-md">
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
				</div>

				<div className="col-span-1 md:col-span-5">
					<div className="relative w-full">
						<Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
						<input
							type="date"
							value={formik.values.date}
							min={today}
							onChange={formik.handleChange}
							name="date"
							className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm"
						/>
					</div>
				</div>

				<div className="col-span-1 flex justify-center md:col-span-3">
					<button
						type="submit"
						disabled={formik.isSubmitting || isPending}
						className="w-full rounded-md bg-secondary px-3 py-2 text-sm font-semibold uppercase text-white hover:bg-secondary-dark disabled:bg-gray-400"
					>
						{isPending ? "Recherche..." : "Rechercher"}
					</button>
				</div>
			</form>
		</>
	);
};
