import { Check } from "lucide-react";

export const Stepper = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => 

<div className="flex w-2/3 items-center justify-between sm:w-1/2">
    {[1, 2].map((step, index) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
            <div key={step} className="flex flex-1 items-center">
                {/* Circle */}
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
            ${isCompleted
                            ? "bg-white text-primary border-2 border-primary"
                            : isCurrent
                                ? "bg-primary text-white"
                                : "border-2 border-gray-300 text-gray-500"
                        }
          `}
                >
                    {isCompleted ? <Check className="h-4 w-4" /> : step}
                </div>

                {/* Connector (except last step) */}
                {index < totalSteps - 1 && (
                    <div className="mx-2 h-0.5 flex-1 bg-gray-300" />
                )}
            </div>
        );
    })}
</div>