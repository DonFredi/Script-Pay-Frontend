import NavLink from "./components/NavLink";

export const navLinks = [
  { to: "/", label: "Home" },
  // Was hardcoded to "/admin/dashboard" — nonsensical for a navbar shown to every
  // visitor regardless of role (or logged-out at all). "/dashboard" is the
  // generic entry point; middleware + the login flow's own role-based redirect
  // already send SUPER_ADMIN to /admin/dashboard specifically after login.
  // { to: "/dashboard", label: "Dashboard" },
  // { to: "/api-docs", label: "API Docs" },
  // //   { to: "/onboarding", label: "Onboarding" },
  // { to: "/payments", label: "Payments" },
  // { to: "/transactions", label: "Transactions" },
  // //   { to: "/contact", label: "Contact us" },
  // //   { to: "/profile", label: "Profile" },
];

export default function Navbar() {
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
