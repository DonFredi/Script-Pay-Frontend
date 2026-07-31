import { Code2 } from "lucide-react";

const Code = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      <Code2 size={32} strokeWidth={2} className="text-green-600" />
      <span className="text-lg ">Trusted by developers</span>
    </div>
  );
};

export default Code;
