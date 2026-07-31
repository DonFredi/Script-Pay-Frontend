"use client";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import HomePage from "@/modules/home/HomePage";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { H4, H5, P } from "@/shared/components/ui/Typography";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <div>
      {/* <SectionWrapper className="flex items-center gap-5">
        <Button onClick={() => router.push("/auth/login")}>Login</Button>
        <Button variant="secondary" onClick={() => router.push("/auth/register")}>
          Register
        </Button>
      </SectionWrapper> */}
      {/* <SectionWrapper>
        <div className="flex flex-col gap-1.5 w-fit p-6 rounded-xl border border-foreground-border">
          <H4>{user?.email}</H4>
          <H5>{user?.username}</H5>
          <P className="text-caption-sm text-foreground-caption">{user?.id}</P>
        </div>
      </SectionWrapper> */}
      <HomePage />
      {/* <SectionWrapper>Hero Section</SectionWrapper>
      <SectionWrapper>Products</SectionWrapper>
      <SectionWrapper>Services</SectionWrapper>
      <SectionWrapper>Call to Action</SectionWrapper> */}
    </div>
  );
}
