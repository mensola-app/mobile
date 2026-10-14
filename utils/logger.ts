import { captureException } from "./monitoring";

/**
 * Application Logger
 *
 * Provides environment-aware logging.
 * - In development (__DEV__ === true): logs to the console for debugging.
 * - In production: suppresses stdout/stderr to prevent sensitive data/PII leaks
 *   and forwards critical errors to Sentry if monitoring is enabled.
 */
export const logger = {
    log: (...args: unknown[]): void => {
        if (__DEV__) {
            console.log(...args);
        }
    },

    info: (...args: unknown[]): void => {
        if (__DEV__) {
            console.info(...args);
        }
    },

    warn: (...args: unknown[]): void => {
        if (__DEV__) {
            console.warn(...args);
        }
    },

    debug: (...args: unknown[]): void => {
        if (__DEV__) {
            console.debug(...args);
        }
    },

    error: (message: string, error?: unknown, extra?: Record<string, unknown>): void => {
        if (__DEV__) {
            if (error !== undefined) {
                console.error(message, error, extra);
            } else {
                console.error(message);
            }
        }

        // Forward error to Sentry/monitoring
        if (error || message) {
            captureException(error || new Error(message), {
                logMessage: message,
                ...extra,
            });
        }
    },
};

export default logger;
