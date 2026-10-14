import { Alert, Share } from "react-native";
import {
    shareContent,
    shareMovieList,
    sharePlaylist,
    shareAlbum,
    shareMovie,
    shareUserProfile,
    shareArtist,
    useShare,
    isUserCancellation,
} from "./share";
import * as shortLinkService from "@/services/shortLink.service";

jest.mock("i18next", () => ({
    t: jest.fn((key: string, options?: any) => {
        if (options?.defaultValue) {
            let res = options.defaultValue;
            if (options.title) res = res.replace("{{title}}", options.title);
            if (options.name) res = res.replace("{{name}}", options.name);
            if (options.username) res = res.replace("{{username}}", options.username);
            if (options.url) res = res.replace("{{url}}", options.url);
            return res;
        }
        return key;
    }),
}));

describe("utils/share", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, "alert").mockImplementation(() => {});
    });

    describe("isUserCancellation", () => {
        it("returns true for user cancellation or dismissal messages", () => {
            expect(isUserCancellation(new Error("User cancelled share"))).toBe(true);
            expect(isUserCancellation(new Error("Canceled by user"))).toBe(true);
            expect(isUserCancellation(new Error("User did not share"))).toBe(true);
            expect(isUserCancellation(new Error("Dialog was dismissed"))).toBe(true);
        });

        it("returns false for non-cancellation errors or falsy inputs", () => {
            expect(isUserCancellation(new Error("Network failure"))).toBe(false);
            expect(isUserCancellation(null)).toBe(false);
            expect(isUserCancellation(undefined)).toBe(false);
            expect(isUserCancellation("string error")).toBe(false);
        });
    });

    describe("shareContent", () => {
        it("returns true when content is successfully shared", async () => {
            jest.spyOn(Share, "share").mockResolvedValueOnce({
                action: Share.sharedAction,
            });

            const result = await shareContent({
                title: "Test Title",
                message: "Test Message",
                url: "https://mensola.app/test",
            });

            expect(result).toBe(true);
            expect(Share.share).toHaveBeenCalledWith({
                title: "Test Title",
                message: "Test Message",
                url: "https://mensola.app/test",
            });
            expect(Alert.alert).not.toHaveBeenCalled();
        });

        it("returns false when user dismisses the native dialog without error", async () => {
            jest.spyOn(Share, "share").mockResolvedValueOnce({
                action: Share.dismissedAction,
            });

            const result = await shareContent({
                title: "Test Title",
                message: "Test Message",
            });

            expect(result).toBe(false);
            expect(Alert.alert).not.toHaveBeenCalled();
        });

        it("displays an Alert when Share.share throws an unexpected error", async () => {
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
            jest.spyOn(Share, "share").mockRejectedValueOnce(new Error("Native share failed"));

            const result = await shareContent({
                title: "Test Title",
                message: "Test Message",
            });

            expect(result).toBe(false);
            expect(Alert.alert).toHaveBeenCalledWith(
                "Hata",
                "Paylaşım yapılırken bir hata oluştu. Lütfen tekrar deneyiniz."
            );
            consoleSpy.mockRestore();
        });

        it("does NOT display an Alert when error represents a user cancellation", async () => {
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
            jest.spyOn(Share, "share").mockRejectedValueOnce(new Error("User did not share"));

            const result = await shareContent({
                title: "Test Title",
                message: "Test Message",
            });

            expect(result).toBe(false);
            expect(Alert.alert).not.toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it("suppresses Alert when showErrorAlert is false", async () => {
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
            jest.spyOn(Share, "share").mockRejectedValueOnce(new Error("Some error"));

            const result = await shareContent({
                title: "Test Title",
                showErrorAlert: false,
            });

            expect(result).toBe(false);
            expect(Alert.alert).not.toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe("Specific entity share functions", () => {
        beforeEach(() => {
            jest.spyOn(Share, "share").mockResolvedValue({
                action: Share.sharedAction,
            });
        });

        it("shareMovieList generates short link and shares formatted content", async () => {
            jest.spyOn(shortLinkService, "getOrCreateShortLink").mockResolvedValueOnce(
                "https://mensola.app/abcde"
            );

            const result = await shareMovieList({ id: "list-1", title: "Top 10" });
            expect(result).toBe(true);
            expect(shortLinkService.getOrCreateShortLink).toHaveBeenCalledWith("movie_list", "list-1");
            expect(Share.share).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Top 10",
                    url: "https://mensola.app/abcde",
                })
            );
        });

        it("sharePlaylist generates short link and shares formatted content", async () => {
            jest.spyOn(shortLinkService, "getOrCreateShortLink").mockResolvedValueOnce(
                "https://mensola.app/plist"
            );

            const result = await sharePlaylist({ id: "p-1", title: "Chill" });
            expect(result).toBe(true);
            expect(shortLinkService.getOrCreateShortLink).toHaveBeenCalledWith("playlist", "p-1");
            expect(Share.share).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Chill",
                    url: "https://mensola.app/plist",
                })
            );
        });

        it("shareAlbum shares album URL with formatted message", async () => {
            const result = await shareAlbum({ id: "alb-1", title: "Discovery" });
            expect(result).toBe(true);
            expect(Share.share).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Discovery",
                    url: "https://mensola.app/albums/alb-1",
                })
            );
        });

        it("shareMovie shares movie URL with formatted message", async () => {
            const result = await shareMovie({ id: "mov-1", title: "Inception" });
            expect(result).toBe(true);
            expect(Share.share).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Inception",
                    url: "https://mensola.app/movies/mov-1",
                })
            );
        });

        it("shareUserProfile generates short link and shares formatted content", async () => {
            jest.spyOn(shortLinkService, "getOrCreateShortLink").mockResolvedValueOnce(
                "https://mensola.app/u1234"
            );

            const result = await shareUserProfile({ id: "u-1", username: "alice" });
            expect(result).toBe(true);
            expect(shortLinkService.getOrCreateShortLink).toHaveBeenCalledWith("user", "u-1");
            expect(Share.share).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "@alice",
                    url: "https://mensola.app/u1234",
                })
            );
        });

        it("shareArtist generates short link and shares formatted content", async () => {
            jest.spyOn(shortLinkService, "getOrCreateShortLink").mockResolvedValueOnce(
                "https://mensola.app/art99"
            );

            const result = await shareArtist({ id: "a-1", name: "Radiohead" });
            expect(result).toBe(true);
            expect(shortLinkService.getOrCreateShortLink).toHaveBeenCalledWith("artist", "a-1");
            expect(Share.share).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Radiohead",
                    url: "https://mensola.app/art99",
                })
            );
        });
    });

    describe("useShare hook", () => {
        it("returns all share functions", () => {
            const hook = useShare();
            expect(typeof hook.shareContent).toBe("function");
            expect(typeof hook.shareMovieList).toBe("function");
            expect(typeof hook.sharePlaylist).toBe("function");
            expect(typeof hook.shareMovie).toBe("function");
            expect(typeof hook.shareUserProfile).toBe("function");
            expect(typeof hook.shareArtist).toBe("function");
        });
    });
});
