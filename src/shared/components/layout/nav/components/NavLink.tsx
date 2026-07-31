import Link from "next/link";

interface NavLinkProps {
  href: string;
  label: string;
}

export default function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-sm inline-block hover:scale-105 duration-200 ease-in"
    >
      {label}
    </Link>
  );
}
