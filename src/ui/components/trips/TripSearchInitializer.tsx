"use client";

import { useEffect } from "react";
import { useTripSearch } from "@/context/TripSearchContext";
import SimpleHeroSearch from "@/ui/components/HeroSearch/SimpeHeroSearch";
import { AssignedAttributeValueFragment } from "@/gql/graphql";
import TripHeader from "./TripHeader";
import TripResults from "./TripResults";

interface TripSearchInitializerProps {
  originData: AssignedAttributeValueFragment | null | undefined;
  destinationData: AssignedAttributeValueFragment | null | undefined;
  date: string;
}

export default function TripSearchInitializer({
  originData,
  destinationData,
  date,
}: TripSearchInitializerProps) {
  const { data, setData } = useTripSearch();

  // ✅ Initialize context when data arrives
  useEffect(() => {
    if (originData && destinationData) {
      setData({
        tripType: "oneway",
        origin: {
          id: originData.id ?? "",
          name: originData.name ?? "",
          slug: originData.slug ?? "",
        },
        destination: {
          id: destinationData.id ?? "",
          name: destinationData.name ?? "",
          slug: destinationData.slug ?? "",
        },
        date,
      });
    }
  }, [originData, destinationData, date, setData]);

  // Optional: show nothing until data is ready
  if (!data) return null;

  return (
    <>
      <SimpleHeroSearch data={data} />
      <TripHeader destinationName={data.destination.name} date={data.date} />
      <TripResults
        originSlug={data.origin.slug}
        destinationSlug={data.destination.slug}
        date={data.date}
      />
    </>
  );
}
