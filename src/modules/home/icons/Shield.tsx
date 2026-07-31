import { ShieldCheck } from "lucide-react";

const Shield = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      <ShieldCheck size={32} strokeWidth={2} className="text-green-600" />

      <span className="text-lg">Secure</span>
    </div>
  );
};

export default Shield;
