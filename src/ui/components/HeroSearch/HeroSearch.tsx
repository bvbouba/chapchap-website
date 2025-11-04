"use client";

import { useParams,useRouter } from "next/navigation";
import TripSearchForm, { FormValues } from "./form";
import { useTripSearch } from "@/context/TripSearchContext";


export default function HeroSearch() {
  const router = useRouter()	
  const params = useParams<{ channel: string }>();
  const { data } = useTripSearch();

  const handleSearchSubmit = (values: FormValues & { tripType: "oneway" | "roundtrip" }) => {
    router.push(`/${params.channel}/trips/${values.origin.id}/${values.destination.id}`)  
  };
  return (
    <section className="relative">
      <div
        className="relative bg-cover bg-no-repeat h-[296px]"
        style={{ backgroundImage: "url('/hero-header.svg')", backgroundPosition: "-270px center" }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative flex items-center justify-center -mt-40 z-10">
        <div className="bg-white text-[#44474a] p-8 rounded-2xl shadow-xl w-full max-w-6xl mx-4">
          <h1 className="text-xl md:text-2xl font-bold mb-2">
            Recherchez & Réservez des billets de bus pas chers en ligne
          </h1>
          <p className="text-xs md:text-sm mb-4 text-gray-600">
            Trouvez et comparez les meilleures options de voyage terrestre en un seul endroit.
          </p>

          {/* ✅ Reusable trip form */}
          <TripSearchForm onSubmit={handleSearchSubmit} data={data}/>
        </div>
      </div>
    </section>
  );
}
