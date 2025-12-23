"use client";

import { TripSearchData, useTripSearch } from "@/context/TripSearchContext";
import TripSearchForm, { FormValues } from "./form";
import { useParams, useRouter } from "next/navigation";
import { citiesType } from "./HeroSearch";

export default function SimpleHeroSearch({ data,cities }: { data?: TripSearchData, 	cities : citiesType}) {
  const { setData } = useTripSearch();
  const router = useRouter(); // Initialize router
  const params = useParams(); // Get current channel from URL

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
      query: {
        origin: values.origin.slug,
        destination: values.destination.slug,
        date: values.date
      }
    });

    // ✅ Update URL path
    const channel = params.channel || "ci";
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;


    if (currentPath.includes(`/${channel}/trips/`)) {
      const newPath = `/${channel}/trips/${values.origin.id}/${values.destination.id}`;
      router.push(newPath);
      return;
    }

    if (currentPath.includes(`/${channel}/categories/`) && currentSearch.includes("filters=")) {
      return;
    }

    if (currentPath.includes(`/${channel}/categories/`)) {
      const newPath = `/${channel}/categories/${values.origin.slug}-${values.destination.slug}`;
      window.history.pushState(null, "", newPath);
      return;
    }

  };

  return (
    <section className="relative border-y border-gray-300">
      <div className="relative flex items-center justify-center">
        <div className="bg-white text-[#44474a] p-8 rounded-2xl w-full max-w-6xl mx-4">
          <TripSearchForm onSubmit={handleSearchSubmit} data={data} cities={cities}/>
        </div>
      </div>
    </section>
  );
}
