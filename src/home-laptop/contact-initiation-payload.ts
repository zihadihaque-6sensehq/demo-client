import type { ContactInitiationPayload } from "./home-laptop.types";
import { HomeLaptopServiceError } from "./home-laptop.errors";

const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export const ALLOWED_CONTACT_PAYLOAD_KEYS = new Set(["name", "email"]);

const CONTACT_EMAIL_PATTERN =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

function validationError(message: string, userVisibleError: string): never {
  throw new HomeLaptopServiceError(message, 400, userVisibleError);
}

export function sanitizeContactInputString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  return value.replace(CONTROL_CHAR_PATTERN, "").trim();
}

export function normalizeContactInitiationPayload(
  value: unknown,
): ContactInitiationPayload | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    validationError(
      "Validation failed: payload must be an object",
      "Contact form data is invalid. Please complete the form and try again.",
    );
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!ALLOWED_CONTACT_PAYLOAD_KEYS.has(key)) {
      validationError(
        `Validation failed: unexpected contact payload field "${key}"`,
        "Contact form contains invalid fields. Please review your submission.",
      );
    }
  }

  const normalized: ContactInitiationPayload = {};

  if (record.name !== undefined) {
    if (typeof record.name !== "string") {
      validationError(
        "Validation failed: payload.name must be a string",
        "Please enter your name before submitting.",
      );
    }
    const name = sanitizeContactInputString(record.name);
    if (!name) {
      validationError(
        "Validation failed: payload.name must be a non-empty string",
        "Please enter your name before submitting.",
      );
    }
    if (name.length > 200) {
      validationError(
        "Validation failed: payload.name exceeds maximum length",
        "Please shorten your name and try again.",
      );
    }
    normalized.name = name;
  }

  if (record.email !== undefined) {
    if (typeof record.email !== "string") {
      validationError(
        "Validation failed: payload.email must be a string",
        "Please enter a valid email address before submitting.",
      );
    }
    const email = sanitizeContactInputString(record.email)?.toLowerCase();
    if (!email || !CONTACT_EMAIL_PATTERN.test(email)) {
      validationError(
        "Validation failed: payload.email must be a valid email address",
        "Please enter a valid email address before submitting.",
      );
    }
    if (email.length > 254) {
      validationError(
        "Validation failed: payload.email exceeds maximum length",
        "Please enter a valid email address before submitting.",
      );
    }
    normalized.email = email;
  }

  return normalized;
}