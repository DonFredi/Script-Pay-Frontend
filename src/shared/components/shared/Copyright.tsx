import { siteConfig } from "@/config/site";

export default function Copyright() {
  return (
    <small className="text-muted-foreground">
      &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved
    </small>
  );
}
