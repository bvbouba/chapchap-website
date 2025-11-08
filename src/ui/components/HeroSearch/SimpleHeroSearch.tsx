"use client";

import { TripSearchData, useTripSearch } from "@/context/TripSearchContext";
import TripSearchForm, { FormValues } from "./form";
import { useParams, usePathname } from "next/navigation";

export default function SimpleHeroSearch({ data }: { data?: TripSearchData }) {
  const { setData } = useTripSearch();
  const params = useParams<{ channel: string }>();
  const pathname = usePathname(); // ✅ Get current URL path
  console.log(pathname)

  const handleSearchSubmit = (values: FormValues & { tripType: "oneway" | "roundtrip" }) => {
    // ✅ Map form values to TripSearchData
    const tripData: TripSearchData = {
      tripType: values.tripType,
      origin: {
        id: values.origin.id ?? "",
        name: values.origin.name ?? "",
        slug: values.origin.slug ?? "",
      },
      destination: {
        id: values.destination.id ?? "",
        name: values.destination.name ?? "",
        slug: values.destination.slug ?? "",
      },
      date: values.date,
      returnDate: values.returnDate,
    };

    // ✅ Update context
    setData({
      ...tripData,
      query:{
        origin:values.origin.slug,
        destination:values.destination.slug,
        date:values.date
      }
    });
    
  };

  return (
    <section className="relative border-y border-gray-300">
      <div className="relative flex items-center justify-center">
        <div className="bg-white text-[#44474a] p-8 rounded-2xl w-full max-w-6xl mx-4">
          <TripSearchForm onSubmit={handleSearchSubmit} data={data} />
        </div>
      </div>
    </section>
  );
}
