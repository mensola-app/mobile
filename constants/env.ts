/**
 * Global Environment Configuration
 * Central single-source-of-truth for all environment variables.
 */

export const API_BASE_URL: string =
    process.env.EXPO_PUBLIC_API_URL?.trim() || "https://api.mensola.app";

export const GOOGLE_WEB_CLIENT_ID: string | undefined =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

export const SENTRY_DSN: string | undefined =
    process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
