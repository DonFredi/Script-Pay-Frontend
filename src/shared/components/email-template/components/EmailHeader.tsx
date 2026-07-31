import { siteConfig } from "@/config/site";
import { Link } from "@react-email/components";

export default function EmailHeader() {
  return (
    <Link style={logo} target="_blank" href={siteConfig.siteUrl}>
      {siteConfig.name}
    </Link>
  );
}

const logo = {
  margin: "0 auto",
  fontSize: "24px",
  fontWeight: "800",
  width: "fit-content",
};
