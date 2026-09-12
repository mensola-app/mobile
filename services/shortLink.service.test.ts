import { getOrCreateShortLink } from "./shortLink.service";
import { client } from "@/api/client";

jest.mock("@/api/client", () => ({
    client: {
        post: jest.fn(),
    },
}));

describe("shortLink.service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return short URL when API returns code", async () => {
        (client.post as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: { code: "5nWaZ" },
        });

        const url = await getOrCreateShortLink("movie_list", "123e4567-e89b-12d3-a456-426614174000");
        expect(url).toBe("https://mensola.app/5nWaZ");
        expect(client.post).toHaveBeenCalledWith("/api/short-links", {
            targetType: "movie_list",
            targetId: "123e4567-e89b-12d3-a456-426614174000",
        });
    });

    it("should fallback to full canonical URL when API call fails", async () => {
        (client.post as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

        const url = await getOrCreateShortLink("playlist", "123e4567-e89b-12d3-a456-426614174000");
        expect(url).toBe("https://mensola.app/playlists/123e4567-e89b-12d3-a456-426614174000");
    });

    it("should fallback to users URL for user target", async () => {
        (client.post as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

        const url = await getOrCreateShortLink("user", "user-uuid-123");
        expect(url).toBe("https://mensola.app/users/user-uuid-123");
    });
});
