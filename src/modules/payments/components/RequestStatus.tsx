import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { StatusType } from "../StatusTypes";

interface RequestStatusProps {
  status: StatusType;
}

const steps: {
  id: StatusType;
  title: string;
  description: string;
}[] = [
  {
    id: "pending",
    title: "Transaction Pending",
    description: "Waiting for STK Push initiation",
  },
  {
    id: "success",
    title: "Payment Successful",
    description: "Transaction completed successfully",
  },
  {
    id: "failed",
    title: "Payment Failed",
    description: "Transaction was not completed",
  },
];

export const RequestStatus = ({ status }: RequestStatusProps) => {
  const currentIndex = steps.findIndex((step) => step.id === status);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm my-6 md:my-0">
      <h3 className="text-lg font-semibold">Request Status</h3>
      <p className="text-sm text-muted-foreground mb-6">Track your payment request in real time.</p>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;

          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    completed && "bg-green-500 border-green-500 text-white",
                    active && "bg-blue-500 border-blue-500 text-white",
                    !completed && !active && "border-muted-foreground/30 bg-background",
                  )}
                >
                  {completed ? <Check className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                </div>

                {index !== steps.length - 1 && (
                  <div className={cn("mt-1 h-10 w-0.5", completed ? "bg-green-500" : "bg-border")} />
                )}
              </div>

              <div className="pb-4">
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
