import * as Sentry from "@sentry/react-native";
import { SENTRY_DSN } from "@/constants/env";

/**
 * Crash / error reporting (Sentry).
 *
 * - Enabled only when EXPO_PUBLIC_SENTRY_DSN is set AND the app is not running in dev (__DEV__).
 * - Without a DSN every function here is a safe no-op, so local development and tests are unaffected.
 */
export const isMonitoringEnabled = (): boolean => Boolean(SENTRY_DSN) && !__DEV__;

export const initMonitoring = (): void => {
    if (!isMonitoringEnabled()) return;

    Sentry.init({
        dsn: SENTRY_DSN,
        // Never attach IP / device identifiers automatically.
        sendDefaultPii: false,
        // Error reporting only; no performance tracing for v1.0.0.
        tracesSampleRate: 0,
        enableNativeCrashHandling: true,
        enableAutoSessionTracking: true,
    });
};

export const captureException = (error: unknown, context?: Record<string, unknown>): void => {
    if (!isMonitoringEnabled()) return;
    Sentry.captureException(error, context ? { extra: context } : undefined);
};

export const setMonitoringUser = (userId?: string): void => {
    if (!isMonitoringEnabled()) return;
    Sentry.setUser(userId ? { id: userId } : null);
};

export const wrapRootComponent = <P extends Record<string, unknown>>(component: React.ComponentType<P>) =>
    isMonitoringEnabled() ? Sentry.wrap(component) : component;
