import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { navLinks } from "./Navbar";
import MobileNavLink from "./components/MobileNavLink";
import { Menu, XIcon } from "lucide-react";
import { siteConfig } from "@/config/site";
import Copyright from "@/shared/components/shared/Copyright";
import Badge from "../../shared/Badge";

export default function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false} side="left" className="p-4 justify-between">
        <SheetHeader className="flex-row items-center p-0 justify-between">
          <SheetTitle asChild className="">
            <Badge />
          </SheetTitle>
          <SheetDescription className="sr-only">
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
          <SheetClose asChild>
            <Button variant="ghost" className="w-fit translate-x-1/4">
              <XIcon className="size-6" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <nav className="flex-1 flex flex-col justify-center">
          <ul className="flex flex-col gap-1 divide-y divide-slate-200">
            {navLinks.map((navLink) => (
              <li key={navLink.label} className="">
                <SheetClose asChild>
                  <MobileNavLink href={navLink.to} label={navLink.label} />
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>
        <SheetFooter className="text-center p-0">
          <small className="text-green-400">{siteConfig.name}</small>
          <Copyright />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
