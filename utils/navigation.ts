/**
 * Navigation and Deep Link Security Utilities
 *
 * Validates and sanitizes destination paths received from push notifications,
 * deep links, and external intents to prevent open redirect vulnerabilities,
 * path traversal attacks, and application crashes caused by invalid routes.
 */

// Whitelist of valid application route patterns (regex matching pathnames)
const ALLOWED_ROUTE_PATTERNS: RegExp[] = [
    // Root & Tabs
    /^\/$/,
    /^\/(\(tabs\)\/)?(home|search|notifications|me)(\/(edit|[a-zA-Z0-9_.-]+))?$/,

    // Details & Entities
    /^\/movies\/[a-zA-Z0-9_.-]+$/,
    /^\/tracks\/[a-zA-Z0-9_.-]+$/,
    /^\/albums\/[a-zA-Z0-9_.-]+$/,
    /^\/artists\/[a-zA-Z0-9_.-]+(\/discography)?$/,
    /^\/movie-lists\/[a-zA-Z0-9_.-]+$/,
    /^\/playlists\/[a-zA-Z0-9_.-]+$/,
    /^\/users\/[a-zA-Z0-9_.-]+(\/[a-zA-Z0-9_.-]+)?$/,
    /^\/comments\/[a-zA-Z0-9_.-]+(\/[a-zA-Z0-9_.-]+)?$/,
    /^\/interactions\/[a-zA-Z0-9_.-]+$/,
    /^\/taste-card(\/[a-zA-Z0-9_.-]+)?$/,

    // Settings
    /^\/settings(\/(about|account\/(update-email|update-password|update-username)))?$/,
];

const SAFE_QUERY_REGEX = /^[a-zA-Z0-9_=&%.-]*$/;

/**
 * Validates whether the given raw path is a safe, allowed internal application route.
 *
 * @param rawPath - Path string received from notification or deep link payload
 * @returns boolean indicating if the path is safe to navigate to
 */
export function isValidNotificationPath(rawPath: unknown): boolean {
    return sanitizeNotificationPath(rawPath) !== null;
}

/**
 * Sanitizes and normalizes an incoming notification path.
 * Strips supported schemes (e.g., `mensola://`), rejects unsafe protocols,
 * rejects directory traversal attempts, and ensures the pathname strictly
 * matches an allowed internal route pattern.
 *
 * @param rawPath - Candidate path to be sanitized
 * @returns Normalized safe path string starting with `/`, or `null` if invalid/disallowed
 */
export function sanitizeNotificationPath(rawPath: unknown): string | null {
    if (typeof rawPath !== "string") {
        return null;
    }

    let trimmed = rawPath.trim();
    if (!trimmed) {
        return null;
    }

    // Strip custom app schemes: mensola://, mensola:///
    if (/^mensola:\/\//i.test(trimmed)) {
        trimmed = trimmed.replace(/^mensola:\/\/*/i, "/");
    } else if (/^mensola:\/*/i.test(trimmed)) {
        trimmed = trimmed.replace(/^mensola:\/*/i, "/");
    }

    // Reject dangerous schemes or external protocols
    if (/^[a-zA-Z0-9+.-]+:/.test(trimmed)) {
        return null;
    }

    // Reject protocol-relative URLs (e.g., //example.com)
    if (trimmed.startsWith("//")) {
        return null;
    }

    // Reject backslashes (Windows-style path injection / bypass attempts)
    if (trimmed.includes("\\")) {
        return null;
    }

    // Reject path traversal attempts (.. or %2e%2e)
    if (trimmed.includes("..") || /%2e%2e/i.test(trimmed)) {
        return null;
    }

    // Ensure leading slash
    if (!trimmed.startsWith("/")) {
        trimmed = `/${trimmed}`;
    }

    // Separate pathname and query parameters
    const [pathname, queryString, ...extra] = trimmed.split("?");
    if (extra.length > 0) {
        // Multiple '?' characters are suspicious / malformed
        return null;
    }

    // Normalize multiple consecutive slashes in pathname (e.g., ///movies///123 -> /movies/123)
    const normalizedPathname = pathname.replace(/\/+/g, "/");

    // Remove trailing slash unless it's just "/"
    const canonicalPathname =
        normalizedPathname.length > 1 && normalizedPathname.endsWith("/")
            ? normalizedPathname.slice(0, -1)
            : normalizedPathname;

    // Check against allowed route patterns
    const isAllowed = ALLOWED_ROUTE_PATTERNS.some((pattern) =>
        pattern.test(canonicalPathname)
    );

    if (!isAllowed) {
        return null;
    }

    // Validate query string if present
    if (queryString !== undefined) {
        if (!SAFE_QUERY_REGEX.test(queryString)) {
            return null;
        }
        return `${canonicalPathname}?${queryString}`;
    }

    return canonicalPathname;
}
