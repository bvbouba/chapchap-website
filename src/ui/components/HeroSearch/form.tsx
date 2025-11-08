"use client";

import { AssignedAttributeValueFragment } from "@/gql/graphql";
import { useState, useEffect, useRef } from "react";
import { MapPin, Calendar, ArrowLeftRight } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TripSearchData, useTripSearch } from "@/context/TripSearchContext";
import {TripSearchFormSkeleton} from "./skeleton";

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
    data?:TripSearchData | null
  }

export default function TripSearchForm({ onSubmit,data,  initialTripType = "oneway"}: TripSearchFormProps) {
const [tripType, setTripType] = useState<"oneway" | "roundtrip">(initialTripType);
  const [departureCities, setDepartureCities] = useState<AssignedAttributeValueFragment[]>([]);
  const [arrivalCities, setArrivalCities] = useState<AssignedAttributeValueFragment[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<AssignedAttributeValueFragment[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<AssignedAttributeValueFragment[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [originDisplay, setOriginDisplay] = useState("");
  const [destinationDisplay, setDestinationDisplay] = useState("");
  const [loading, setLoading] = useState(true);
  const [originSlug, setOriginSlug] = useState("");
  const [destinationSlug, setDestinationSlug] = useState("");

  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];
  const {setData} = useTripSearch()

   // ✅ Load all cities
   useEffect(() => {
    const fetchAllCities = async () => {
      try {
        setLoading(true); // start loading
        const [departureRes, arrivalRes] = await Promise.all([
          fetch("/api/search-cities?type=departure"),
          fetch("/api/search-cities?type=arrival"),
        ]);

        const depData = (await departureRes.json()) as { results: AssignedAttributeValueFragment[] };
        const arrData = (await arrivalRes.json()) as { results: AssignedAttributeValueFragment[] };

        setDepartureCities(depData.results);
        setArrivalCities(arrData.results);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      } finally {
        setLoading(false); // end loading
      }
    };
    fetchAllCities();
  }, []);

  
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
        setData({...payload,
          query:{
            origin:values.origin,
            destination:values.destination,
            date:values.date
          }
        })
        onSubmit(payload);
      } else {
        console.log(payload);
      }
    },
  });

  // ✅ Suggestions filtering
  useEffect(() => {
    if (formik.values.origin.length >= 2) {
      const filtered = departureCities.filter((c) =>
        c.name?.toLowerCase().includes(formik.values.origin.toLowerCase())
      );
      setOriginSuggestions(filtered.slice(0, 10));
    }
  }, [formik.values.origin, departureCities]);

  useEffect(() => {
    if (formik.values.destination.length >= 2) {
      const filtered = arrivalCities.filter((c) =>
        c.name?.toLowerCase().includes(formik.values.destination.toLowerCase())
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
    if (loading) {
      return <TripSearchFormSkeleton />;
    }
    

  return (
    <>
       {/* Trip type toggle */}
          <div className="flex items-center gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="oneway"
                checked={tripType === "oneway"}
                onChange={() => {
                  setTripType("oneway");
                  formik.setFieldValue("returnDate", "");
                }}
                className="accent-primary"
              />
              <span>Aller simple</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="roundtrip"
                checked={tripType === "roundtrip"}
                onChange={() => setTripType("roundtrip")}
                className="accent-primary"
              />
              <span>Aller-retour</span>
            </label>
          </div>

          {/* Form */}
          <form
            onSubmit={formik.handleSubmit}
            className={`grid gap-3 sm:gap-4 items-start w-full ${tripType === "roundtrip"
                ? "md:grid-cols-[repeat(24,_minmax(0,_1fr))]"
                : "md:grid-cols-[repeat(19,_minmax(0,_1fr))]"
              }`}
          >
            {/* Origin */}
            <div ref={originRef} className="relative col-span-1 md:col-span-5">
              <MapPin className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
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
                className="pl-10 pr-4 py-2 rounded-md bg-gray-100 text-gray-800 focus:outline-none w-full"
              />
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-md mt-1 w-full max-h-48 overflow-y-auto">
                  {originSuggestions.map((city) => (
                    <li
                      key={city.id}
                      onClick={() => handleSelect(city, "departure")}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {city.name}
                    </li>
                  ))}
                </ul>
              )}
              {formik.touched.origin && formik.errors.origin && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.origin}</p>
              )}
            </div>

            {/* Switch */}
            <div className="col-span-1 md:col-span-1 flex justify-center items-center">
              <button
                type="button"
                onClick={handleSwitch}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                title="Inverser les villes"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* Destination */}
            <div ref={destinationRef} className="relative col-span-1 md:col-span-5">
              <MapPin className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
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
                className="pl-10 pr-4 py-2 rounded-md bg-gray-100 text-gray-800 focus:outline-none w-full"
              />
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-md mt-1 w-full max-h-48 overflow-y-auto">
                  {destinationSuggestions.map((city) => (
                    <li
                      key={city.id}
                      onClick={() => handleSelect(city, "arrival")}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {city.name}
                    </li>
                  ))}
                </ul>
              )}
              {formik.touched.destination && formik.errors.destination && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.destination}</p>
              )}
            </div>

            {/* Dates */}
            <div
              className={`flex col-span-1 ${tripType === "roundtrip" ? "md:col-span-10" : "md:col-span-5"
                }`}
            >
              {/* Departure */}
              <div className={`relative w-full ${tripType === "roundtrip" ? "flex-1" : "w-full"}`}>
                <Calendar
                  onClick={() => {
                    const input = document.getElementById("date-picker") as HTMLInputElement | null;
                    (input as any)?.showPicker?.();
                  }}
                  className="absolute left-3 top-2.5 text-gray-400 w-5 h-5 cursor-pointer"
                />
                <input
                  id="date-picker"
                  name="date"
                  type="date"
                  value={formik.values.date}
                  min={today}
                  onChange={formik.handleChange}
                  className={`pl-10 pr-4 py-2 ${tripType === "roundtrip" ? "rounded-l-md" : "rounded-md"
                    } bg-gray-100 text-gray-800 focus:outline-none w-full appearance-none [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer`}
                />
                {formik.touched.date && formik.errors.date && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.date}</p>
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
                    className="absolute left-3 top-2.5 text-gray-400 w-5 h-5 cursor-pointer"
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
                    className="pl-10 pr-4 py-2 border border-l-0 rounded-r-md bg-gray-100 text-gray-800 focus:outline-none w-full appearance-none [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
                  />
                  {formik.touched.returnDate && formik.errors.returnDate && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.returnDate}</p>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="col-span-1 md:col-span-3 flex justify-center">
            <button
                type="submit"
                className="px-6 py-2 bg-[#97D700] text-white font-semibold rounded-md hover:bg-[#85c200] transition w-full md:w-auto"
              >
                Rechercher
              </button>
            </div>
          </form>
    </>
  );
}
