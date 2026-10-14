import { client } from "@/api/client";
import { LINKS } from "@/constants/links";
import { logger } from "@/utils/logger";

export type ShortLinkTargetType = "movie_list" | "playlist" | "user" | "artist";

export interface ShortLinkResponse {
    code: string;
}

/**
 * Requests a unique 5-character short link from the backend API.
 * Falls back to canonical deep link web URL if request fails.
 */
export const getOrCreateShortLink = async (
    targetType: ShortLinkTargetType,
    targetId: string
): Promise<string> => {
    try {
        const response = await client.post<{ code: string }>("/api/short-links", {
            targetType,
            targetId,
        });

        const code = (response as any)?.data?.code || (response as any)?.code;
        if (code) {
            return LINKS.app.shortLink(code);
        }
    } catch (error) {
        logger.warn("Failed to generate short link, falling back to full URL:", error);
    }

    const routeMap: Record<string, string> = {
        movie_list: "movie-lists",
        user: "users",
        playlist: "playlists",
        artist: "artists",
    };
    
    const route = routeMap[targetType] || "playlists";

    return LINKS.app.entity(route, targetId);
};
