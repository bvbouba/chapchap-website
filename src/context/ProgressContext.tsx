"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Step = "depart" | "return" | "summary" | "checkout";

interface ProgressContextType {
  currentStep: Step;
  setStep: (step: Step) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<Step>("depart");

  return (
    <ProgressContext.Provider value={{ currentStep, setStep: setCurrentStep }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};
