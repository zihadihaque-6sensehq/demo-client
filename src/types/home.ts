export interface MarketingContentBundle {
  headline: string;
  forLabel: string;
  segmentTags: string[];
  trustBadgeText: string;
}

export interface PartnerLogo {
  brandName: string;
  url: string;
  altText: string;
  displayOrder: number;
}

export interface PartnerLogoAssetsResponse {
  logos: PartnerLogo[];
}

export interface SiteNavRoute {
  label: string;
  path: string;
}

export interface SiteNavigationRoutesResponse {
  routes: SiteNavRoute[];
}

export interface ContactInitiationGetResponse {
  redirectUrl?: string;
  modalContentRef?: string;
}

export interface ContactInitiationPayload {
  name?: string;
  email?: string;
}

export interface ContactInitiationPostRequest {
  destinationRoute?: string;
  formId?: string;
  payload?: ContactInitiationPayload;
}

export interface ContactInitiationPostResponse {
  accepted: boolean;
  nextStep: string;
}

export const PARTNER_ASSET_IDS = [
  "zapier",
  "spotify",
  "zoom",
  "slack",
  "amazon",
  "adobe",
] as const;

export const HOME_PAGE_KEY = "home";
export const DEFAULT_LOCALE = "en";