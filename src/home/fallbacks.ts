import adobeLogo from "@/assets/home/partners/adobe.svg";
import amazonLogo from "@/assets/home/partners/amazon.svg";
import slackLogo from "@/assets/home/partners/slack.svg";
import spotifyLogo from "@/assets/home/partners/spotify.svg";
import zapierLogo from "@/assets/home/partners/zapier.svg";
import zoomLogo from "@/assets/home/partners/zoom.svg";
import type {
  MarketingContentBundle,
  PartnerLogo,
  SiteNavRoute,
} from "@/types/home";

export const FALLBACK_MARKETING_BUNDLE: MarketingContentBundle = {
  headline: "A Digital Product Studio that will Work",
  forLabel: "For",
  segmentTags: [
    "Startups",
    "Enterprise leaders",
    "Media & Publishers",
    "Social Good",
  ],
  trustBadgeText: "Trusted By 250+ Companies",
};

export const FALLBACK_NAV_ROUTES: SiteNavRoute[] = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Work", path: "/work" },
  { label: "Process", path: "/process" },
  { label: "About", path: "/about" },
  { label: "Careers", path: "/careers" },
];

export const FALLBACK_PARTNER_LOGOS: PartnerLogo[] = [
  {
    brandName: "Zapier",
    url: zapierLogo,
    altText: "Zapier",
    displayOrder: 1,
  },
  {
    brandName: "Spotify",
    url: spotifyLogo,
    altText: "Spotify",
    displayOrder: 2,
  },
  {
    brandName: "Zoom",
    url: zoomLogo,
    altText: "Zoom",
    displayOrder: 3,
  },
  {
    brandName: "Slack",
    url: slackLogo,
    altText: "Slack",
    displayOrder: 4,
  },
  {
    brandName: "Amazon",
    url: amazonLogo,
    altText: "Amazon",
    displayOrder: 5,
  },
  {
    brandName: "Adobe",
    url: adobeLogo,
    altText: "Adobe",
    displayOrder: 6,
  },
];

export const MISSING_TEXT_FALLBACK = "—";