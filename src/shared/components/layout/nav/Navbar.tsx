"use client";

import NavLink from "./components/NavLink";
import { useNavLinks } from "./useNavLinks";

export default function Navbar() {
  const navLinks = useNavLinks();

  return (
    <nav className="">
      <ul className="flex flex-wrap justify-center items-center divide-x divide-slate-200 gap-2 w-fit">
        {navLinks.map((link) => (
          <li key={link.label} className="">
            <NavLink href={link.to} label={link.label} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
