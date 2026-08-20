"use client";
import { Button } from "@/shared/components/ui/button";
import { Activity, type ReactNode } from "react";
import { useLogout } from "../useLogout";
import { useRouter } from "next/navigation";
import { useAuth } from "../../shared/hooks/useAuth";

export default function LogoutButton({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { mutateAsync, isPending } = useLogout();
  const { isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await mutateAsync();
      router.push("/");
    } catch {
      // logout already surfaces its own error toast via useLogout — this catch only
      // exists so a rejected promise here doesnt become an unhandled rejection.
    }
  };

  return (
    <Activity mode={isAuthenticated ? "visible" : "hidden"}>
      <Button disabled={isPending} variant="destructive" onClick={handleLogout} className="py-2 px-4">
        {children}
      </Button>
    </Activity>
  );
}
