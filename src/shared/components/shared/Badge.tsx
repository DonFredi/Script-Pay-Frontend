import { siteConfig } from "@/config/site";
import Link from "next/link";

export default function Badge() {
  return (
    <Link href="/" className="py-1 px-2 rounded-sm">
      <small className="font-bold text-base">{siteConfig.name}</small>
    </Link>
  );
}
