import { ClockCheck } from "lucide-react";

const Clock = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      <ClockCheck size={32} strokeWidth={2} className="text-green-600" />
      <span className="text-lg">Reliable</span>
    </div>
  );
};

export default Clock;
