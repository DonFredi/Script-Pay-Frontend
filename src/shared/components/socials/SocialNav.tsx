import { siteConfig } from "@/config/site";
import IconLink from "./components/IconLink";
import TwitterIcon from "./icons/TwitterIcon";
import InstagramIcon from "./icons/InstagramIcon";
import TiktokIcon from "./icons/TiktokIcon";
import PinterestIcon from "./icons/PinterestIcon";

export default function SocialNav() {
  return (
    <section className="flex items-center gap-5 fill-red-400">
      <IconLink href={siteConfig.socialLinks.twitter}>
        <TwitterIcon />
      </IconLink>
      <IconLink href={siteConfig.socialLinks.instagram}>
        <InstagramIcon />
      </IconLink>
      <IconLink href={siteConfig.socialLinks.tiktok}>
        <TiktokIcon />
      </IconLink>
      <IconLink href={siteConfig.socialLinks.pinterest}>
        <PinterestIcon />
      </IconLink>
    </section>
  );
}
