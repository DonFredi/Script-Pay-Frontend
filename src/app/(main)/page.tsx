"use client";
import HomePage from "@/modules/home/HomePage";

export default function Home() {
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
