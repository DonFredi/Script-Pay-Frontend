import Link from "next/link";

export default function Developer() {
  return (
    <small className="font-bold text-base">
      Developed by
      <Link href="/" className="underline mx-1">
        ScriptTagg
      </Link>
    </small>
  );
}
