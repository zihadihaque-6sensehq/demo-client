import { normalizeContactInitiationPayload } from "./contact-initiation-payload";
import { HomeLaptopServiceError } from "./home-laptop.errors";
import type {
  ContactInitiationPostResponse,
  PostContactInitiationDto,
} from "./home-laptop.types";

export { HomeLaptopServiceError } from "./home-laptop.errors";

const VALID_CONTACT_DESTINATIONS = new Set([
  "/contact",
  "/#contact",
  "modal:home-contact",
  "modal:contact",
]);

export class HomeLaptopService {
  postContactInitiation(
    dto: PostContactInitiationDto,
  ): ContactInitiationPostResponse {
    this.assertContactOperational("contact-post");

    if (
      dto.destinationRoute &&
      !this.isValidContactDestination(dto.destinationRoute)
    ) {
      throw new HomeLaptopServiceError(
        `Invalid contact destination route: ${dto.destinationRoute}`,
        400,
        "We could not start the contact flow because the destination is invalid.",
      );
    }

    const formId =
      dto.formId ?? process.env.HOME_LAP_CONTACT_FORM_ID ?? "home-contact";

    if (dto.payload !== undefined) {
      dto.payload = normalizeContactInitiationPayload(dto.payload);
    } else if (process.env.HOME_LAP_CONTACT_REQUIRE_PAYLOAD === "true") {
      throw new HomeLaptopServiceError(
        "Validation failed: payload is required for contact submission",
        400,
        "Contact form data is missing. Please complete the form.",
      );
    }

    const nextStep =
      dto.destinationRoute?.startsWith("modal:") || !dto.destinationRoute
        ? `open-modal:${formId}`
        : `redirect:${dto.destinationRoute}`;

    return {
      accepted: true,
      nextStep,
    };
  }

  private isValidContactDestination(destinationRoute: string): boolean {
    return VALID_CONTACT_DESTINATIONS.has(destinationRoute);
  }

  private assertContactOperational(scope: string): void {
    if (process.env.HOME_LAP_SIMULATE_SERVER_ERROR === "true") {
      throw new HomeLaptopServiceError(
        `Home laptop service unavailable (${scope})`,
        500,
        "Something went wrong loading this part of the home page. Please refresh and try again.",
      );
    }
  }
}

export const homeLaptopService = new HomeLaptopService();