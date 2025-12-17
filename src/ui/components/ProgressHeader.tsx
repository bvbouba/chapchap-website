"use client";

import { ChevronRight, CheckIcon } from "lucide-react";
import { useProgress } from "@/context/ProgressContext";
import { useTripSearch } from "@/context/TripSearchContext";

interface Props {
  destinationName?: string;
  date?: string;
}

export default function ProgressHeader({ destinationName, date }: Props) {
  const { currentStep } = useProgress();
  const { data } = useTripSearch();

  const formattedDate = date
    ? new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
    : "";

  // Steps
  const baseSteps = [
    {
      key: "depart",
      label:
        currentStep === "depart" ? (
          <span className="inline-flex items-end ">
            <span className="font-semibold text-xl">{`Départ vers ${destinationName}`}</span>
            {formattedDate ? <span className="text-base">&nbsp;le {formattedDate}</span> : null}
          </span>
        ) : (
          "Départ"
        ),
    },
    ...(data?.tripType === "roundtrip"
      ? [{ key: "return", label: "Retour" }]
      : []),
    { key: "summary", label: "Résumé du voyage" },
    { key: "checkout", label: "Paiement" },
  ];

  const isCompleted = (stepKey: string) =>
    baseSteps.findIndex((s) => s.key === currentStep) >
    baseSteps.findIndex((s) => s.key === stepKey);

  const isActive = (stepKey: string) => currentStep === stepKey;

  const currentIndex = baseSteps.findIndex((s) => s.key === currentStep);
  const leftSteps = baseSteps.slice(0, currentIndex + 1);
  const rightSteps = baseSteps.slice(currentIndex + 1);

  return (
    <div className="relative shadow-md flex items-center justify-center border-b border-gray-300 bg-white">
      <div className="w-full flex justify-between items-center py-4 px-8 max-w-6xl text-sm">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3 text-gray-700">
          {leftSteps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-1">

              {/* Dot for active / empty */}
              {!isCompleted(step.key) && !isActive(step.key) && (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              )}

              {/* Label */}
              <span
                className={`${isActive(step.key)
                    ? "text-gray-700"
                    : isCompleted(step.key)
                      ? "text-gray-700"
                      : "text-gray-500"
                  }`}
              >
                {step.label}
              </span>

              {/* Check AFTER label */}
              {isCompleted(step.key) && (
                <CheckIcon className="w-4 h-4 text-primary ml-1" />
              )}

              {/* Separator */}
              {index < leftSteps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* RIGHT SIDE (remaining steps) */}
        <div className="flex items-center gap-3 text-gray-500">
          {rightSteps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-2">

              {/* ALWAYS show ChevronRight BEFORE the first item */}
              <ChevronRight className="w-6 h-6 text-gray-300" />

              {/* Dot */}
              {
                isCompleted(step.key) ? <>
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  <span className="text-base">{step.label}</span> </> :
                  <span className="text-base">{step.label}</span>

              }
            </div>

          ))}
        </div>

      </div>
    </div>
  );
}
