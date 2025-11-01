"use client";

import { Skeleton } from "@/checkout/components";


export function TripSearchFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Trip type toggle skeleton */}
      <div className="flex items-center gap-6">
        <Skeleton className="w-1/5 h-5" />
        <Skeleton className="w-1/5 h-5" />
      </div>

      {/* Form skeleton */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-[repeat(19,_minmax(0,_1fr))] items-start">
        {/* Origin */}
        <div className="col-span-1 md:col-span-5 space-y-2">
          <Skeleton className="h-10 w-full" />
        </div>



        {/* Destination */}
        <div className="col-span-1 md:col-span-5 space-y-2">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Dates */}
        <div className="flex col-span-1 md:col-span-5 gap-3">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/2" />
        </div>

        {/* Submit button */}
        <div className="col-span-1 md:col-span-3 flex justify-center">
          <Skeleton className="h-10 w-2/3 rounded-md" />
        </div>
      </div>
    </div>
  );
}
