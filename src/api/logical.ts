import { ApiError, apiFetch, parseJson } from "@/api/http";
import type {
  ContactInitiationGetResponse,
  ContactInitiationPostRequest,
  ContactInitiationPostResponse,
  MarketingContentBundle,
  PartnerLogoAssetsResponse,
  SiteNavigationRoutesResponse,
} from "@/types/home";
import {
  DEFAULT_LOCALE,
  HOME_PAGE_KEY,
  PARTNER_ASSET_IDS,
} from "@/types/home";

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, value);
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getMarketingContentBundle(
  locale: string = DEFAULT_LOCALE,
  pageKey: string = HOME_PAGE_KEY,
): Promise<MarketingContentBundle> {
  const response = await apiFetch(
    `/logical/marketing-content-bundle${buildQuery({ locale, pageKey })}`,
    { method: "GET" },
  );

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "Marketing content bundle not found"
        : "Failed to load marketing content",
      response.status,
    );
  }

  return parseJson<MarketingContentBundle>(response);
}

export async function getPartnerLogoAssets(
  assetIds: readonly string[] = PARTNER_ASSET_IDS,
  format: string = "svg",
): Promise<PartnerLogoAssetsResponse> {
  const response = await apiFetch(
    `/logical/partner-logo-assets${buildQuery({
      assetIds: assetIds.join(","),
      format,
    })}`,
    { method: "GET" },
  );

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "Partner logo assets not found"
        : "Failed to load partner logos",
      response.status,
    );
  }

  return parseJson<PartnerLogoAssetsResponse>(response);
}

export async function getSiteNavigationRoutes(
  path?: string,
): Promise<SiteNavigationRoutesResponse> {
  const response = await apiFetch(
    `/logical/site-navigation-routes${buildQuery({ path })}`,
    { method: "GET" },
  );

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "Navigation routes not found"
        : "Failed to load navigation",
      response.status,
    );
  }

  return parseJson<SiteNavigationRoutesResponse>(response);
}

export async function getContactInitiation(params?: {
  destinationRoute?: string;
  formId?: string;
}): Promise<ContactInitiationGetResponse> {
  const response = await apiFetch(
    `/logical/contact-initiation${buildQuery({
      destinationRoute: params?.destinationRoute,
      formId: params?.formId,
    })}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const message =
      response.status === 400
        ? "Invalid contact destination. Please try again later."
        : "Contact is unavailable right now. Please try again later.";
    throw new ApiError(message, response.status);
  }

  return parseJson<ContactInitiationGetResponse>(response);
}

export async function postContactInitiation(
  body: ContactInitiationPostRequest,
): Promise<ContactInitiationPostResponse> {
  const response = await apiFetch("/logical/contact-initiation", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message =
      response.status === 400
        ? "We could not send your message. Check your details and try again."
        : "Contact submission failed. Please try again later.";
    throw new ApiError(message, response.status);
  }

  return parseJson<ContactInitiationPostResponse>(response);
}