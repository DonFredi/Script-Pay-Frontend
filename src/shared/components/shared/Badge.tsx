import { siteConfig } from "@/config/site";
import Image from "next/image";
import Link from "next/link";

/**
 * The brand lockup (S-link mark + wordmark). Single source for every header,
 * sidebar, footer and auth screen — see public/brand/ for the asset files.
 * The wordmark SVG is outlined, so it needs no webfont; alt carries the name.
 */
export default function Badge() {
  return (
    <Link href="/" className="inline-block py-1 px-2 rounded-sm">
      <Image
        src="/brand/scriptpay-logo.svg"
        alt={siteConfig.name}
        width={1185}
        height={240}
        priority
        className="h-8 w-auto"
      />
    </Link>
  );
}
