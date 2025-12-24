"use client";

import { TripSearchData, useTripSearch } from "@/context/TripSearchContext";
import TripSearchForm, { FormValues } from "./form";
import { useParams, useRouter } from "next/navigation";
import { citiesType } from "./HeroSearch";
import { useTransition } from "react";

export default function SimpleHeroSearch({ data,cities }: { data?: TripSearchData, 	cities : citiesType}) {
  const { setData } = useTripSearch();
  const router = useRouter(); // Initialize router
  const params = useParams(); // Get current channel from URL
  const [isPending, startTransition] = useTransition();
  
  const handleSearchSubmit = async (values: FormValues & { tripType: "oneway" | "roundtrip" }) => { 
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

    return new Promise<void>((resolve) => {
      startTransition(() => {
          const channel = params.channel || "ci";
          const currentPath = window.location.pathname;

          if (currentPath.includes(`/${channel}/trips/`)) {
              const newPath = `/${channel}/trips/${values.origin.id}/${values.destination.id}`;
              router.push(newPath);
          } 
          else if (currentPath.includes(`/${channel}/categories/`)) {
              const newPath = `/${channel}/categories/${values.origin.slug}-${values.destination.slug}`;
              window.history.pushState(null, "", newPath);
              // Force a refresh if needed or just let the context update the view
          }
          
          // Artificial delay to ensure the user sees the "Searching" state 
          // especially when staying on the same page
          setTimeout(resolve, 800); 
      });
  });

  };

  return (
    <section className="relative border-y border-gray-300">
      <div className="relative flex items-center justify-center">
        <div className="bg-white text-[#44474a] p-8 rounded-2xl w-full max-w-6xl mx-4">
          <TripSearchForm onSubmit={handleSearchSubmit} data={data} cities={cities} isPending={isPending}/>
        </div>
      </div>
    </section>
  );
}
