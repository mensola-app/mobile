import { sanitizeNotificationPath, isValidNotificationPath } from "./navigation";

describe("Navigation & Deep Link Validation (utils/navigation.ts)", () => {
    describe("Valid application routes", () => {
        it("accepts root and tab routes", () => {
            expect(sanitizeNotificationPath("/")).toBe("/");
            expect(sanitizeNotificationPath("/home")).toBe("/home");
            expect(sanitizeNotificationPath("/search")).toBe("/search");
            expect(sanitizeNotificationPath("/notifications")).toBe("/notifications");
            expect(sanitizeNotificationPath("/me")).toBe("/me");
            expect(sanitizeNotificationPath("/(tabs)/home")).toBe("/(tabs)/home");
            expect(sanitizeNotificationPath("/(tabs)/notifications")).toBe("/(tabs)/notifications");
            expect(sanitizeNotificationPath("/(tabs)/me/edit")).toBe("/(tabs)/me/edit");
            expect(sanitizeNotificationPath("/(tabs)/me/watchlist")).toBe("/(tabs)/me/watchlist");
        });

        it("accepts entity and detail routes with IDs", () => {
            expect(sanitizeNotificationPath("/movies/550")).toBe("/movies/550");
            expect(sanitizeNotificationPath("/movies/movie-uuid-123")).toBe("/movies/movie-uuid-123");
            expect(sanitizeNotificationPath("/tracks/track-456")).toBe("/tracks/track-456");
            expect(sanitizeNotificationPath("/albums/alb-789")).toBe("/albums/alb-789");
            expect(sanitizeNotificationPath("/artists/art-001")).toBe("/artists/art-001");
            expect(sanitizeNotificationPath("/artists/art-001/discography")).toBe("/artists/art-001/discography");
            expect(sanitizeNotificationPath("/movie-lists/list-999")).toBe("/movie-lists/list-999");
            expect(sanitizeNotificationPath("/playlists/pl-888")).toBe("/playlists/pl-888");
            expect(sanitizeNotificationPath("/users/user-123")).toBe("/users/user-123");
            expect(sanitizeNotificationPath("/users/user-123/watchlist")).toBe("/users/user-123/watchlist");
            expect(sanitizeNotificationPath("/comments/comment-555")).toBe("/comments/comment-555");
            expect(sanitizeNotificationPath("/comments/movie/550")).toBe("/comments/movie/550");
            expect(sanitizeNotificationPath("/interactions/int-777")).toBe("/interactions/int-777");
            expect(sanitizeNotificationPath("/taste-card")).toBe("/taste-card");
            expect(sanitizeNotificationPath("/taste-card/user-123")).toBe("/taste-card/user-123");
        });

        it("accepts settings routes", () => {
            expect(sanitizeNotificationPath("/settings")).toBe("/settings");
            expect(sanitizeNotificationPath("/settings/about")).toBe("/settings/about");
            expect(sanitizeNotificationPath("/settings/account/update-email")).toBe("/settings/account/update-email");
            expect(sanitizeNotificationPath("/settings/account/update-password")).toBe("/settings/account/update-password");
            expect(sanitizeNotificationPath("/settings/account/update-username")).toBe("/settings/account/update-username");
        });

        it("strips custom app scheme mensola:// and normalizes path", () => {
            expect(sanitizeNotificationPath("mensola://movies/550")).toBe("/movies/550");
            expect(sanitizeNotificationPath("mensola:///playlists/pl-123")).toBe("/playlists/pl-123");
            expect(sanitizeNotificationPath("mensola:notifications")).toBe("/notifications");
        });

        it("preserves safe query strings", () => {
            expect(sanitizeNotificationPath("/movies/550?tab=comments")).toBe("/movies/550?tab=comments");
            expect(sanitizeNotificationPath("/notifications?filter=unread&page=1")).toBe("/notifications?filter=unread&page=1");
        });

        it("strips trailing slashes from pathnames", () => {
            expect(sanitizeNotificationPath("/movies/550/")).toBe("/movies/550");
            expect(sanitizeNotificationPath("/notifications/")).toBe("/notifications");
        });

        it("isValidNotificationPath returns true for valid routes", () => {
            expect(isValidNotificationPath("/movies/550")).toBe(true);
            expect(isValidNotificationPath("/notifications")).toBe(true);
        });
    });

    describe("Invalid or unsafe routes", () => {
        it("rejects non-string inputs", () => {
            expect(sanitizeNotificationPath(null)).toBeNull();
            expect(sanitizeNotificationPath(undefined)).toBeNull();
            expect(sanitizeNotificationPath(12345)).toBeNull();
            expect(sanitizeNotificationPath({})).toBeNull();
            expect(sanitizeNotificationPath([])).toBeNull();
        });

        it("rejects empty or whitespace-only strings", () => {
            expect(sanitizeNotificationPath("")).toBeNull();
            expect(sanitizeNotificationPath("   ")).toBeNull();
        });

        it("rejects external HTTP/HTTPS and dangerous protocols", () => {
            expect(sanitizeNotificationPath("https://malicious-site.com/movies/550")).toBeNull();
            expect(sanitizeNotificationPath("http://phishing.org")).toBeNull();
            expect(sanitizeNotificationPath("javascript:alert(1)")).toBeNull();
            expect(sanitizeNotificationPath("data:text/html,<h1>XSS</h1>")).toBeNull();
            expect(sanitizeNotificationPath("file:///etc/passwd")).toBeNull();
        });

        it("rejects protocol-relative URLs", () => {
            expect(sanitizeNotificationPath("//evil.com/movies/550")).toBeNull();
            expect(sanitizeNotificationPath("//localhost:3000")).toBeNull();
        });

        it("rejects directory traversal attempts", () => {
            expect(sanitizeNotificationPath("/movies/../settings")).toBeNull();
            expect(sanitizeNotificationPath("/users/user-123/../../secret")).toBeNull();
            expect(sanitizeNotificationPath("/%2e%2e/admin")).toBeNull();
        });

        it("rejects backslashes (Windows-style path injection)", () => {
            expect(sanitizeNotificationPath("/movies\\550")).toBeNull();
            expect(sanitizeNotificationPath("\\settings")).toBeNull();
        });

        it("rejects unallowed/unknown application routes", () => {
            expect(sanitizeNotificationPath("/admin")).toBeNull();
            expect(sanitizeNotificationPath("/admin/dashboard")).toBeNull();
            expect(sanitizeNotificationPath("/unknown-feature")).toBeNull();
            expect(sanitizeNotificationPath("/users/")).toBeNull(); // Missing ID
            expect(sanitizeNotificationPath("/movies")).toBeNull(); // Missing ID
        });

        it("rejects suspicious query strings", () => {
            expect(sanitizeNotificationPath("/movies/550?<script>alert(1)</script>")).toBeNull();
            expect(sanitizeNotificationPath("/movies/550?tab=1?evil=2")).toBeNull(); // Multiple '?'
        });

        it("isValidNotificationPath returns false for invalid routes", () => {
            expect(isValidNotificationPath("https://evil.com")).toBe(false);
            expect(isValidNotificationPath("/admin")).toBe(false);
            expect(isValidNotificationPath(null)).toBe(false);
        });
    });
});
