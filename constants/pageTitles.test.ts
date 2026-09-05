import { getStatTitle, getStatTitles, STAT_TITLES } from "./pageTitles";
import { StatType } from "@/types/stat.types";

describe("pageTitles i18n tests", () => {
    it("returns correct localized title for Turkish", () => {
        const mockT = (key: string) => {
            const trDict: Record<string, string> = {
                "statTitles.watchlist": "İzleme Listesi",
                "statTitles.watched": "İzlenen Filmler",
                "statTitles.likedMovies": "Beğenilen Filmler",
                "statTitles.likedTracks": "Beğenilen Şarkılar",
                "statTitles.likedPlaylists": "Beğenilen Çalma Listeleri",
                "statTitles.likedAlbums": "Beğenilen Albümler",
                "statTitles.playlists": "Çalma Listeleri",
                "statTitles.followers": "Takipçiler",
                "statTitles.following": "Takip Edilenler",
                "statTitles.movieLists": "Film Listeleri",
                "statTitles.likedMovieLists": "Beğenilen Film Listeleri",
                "statTitles.default": "Detay",
            };
            return trDict[key] || key;
        };

        expect(getStatTitle("watchlist", mockT)).toBe("İzleme Listesi");
        expect(getStatTitle("watched", mockT)).toBe("İzlenen Filmler");
        expect(getStatTitle("liked-movies", mockT)).toBe("Beğenilen Filmler");
        expect(getStatTitle("liked-tracks", mockT)).toBe("Beğenilen Şarkılar");
        expect(getStatTitle("liked-playlists", mockT)).toBe("Beğenilen Çalma Listeleri");
        expect(getStatTitle("liked-albums", mockT)).toBe("Beğenilen Albümler");
        expect(getStatTitle("playlists", mockT)).toBe("Çalma Listeleri");
        expect(getStatTitle("followers", mockT)).toBe("Takipçiler");
        expect(getStatTitle("following", mockT)).toBe("Takip Edilenler");
        expect(getStatTitle("movie-lists", mockT)).toBe("Film Listeleri");
        expect(getStatTitle("liked-movie-lists", mockT)).toBe("Beğenilen Film Listeleri");
    });

    it("returns correct localized title for English", () => {
        const mockT = (key: string) => {
            const enDict: Record<string, string> = {
                "statTitles.watchlist": "Watchlist",
                "statTitles.watched": "Watched Movies",
                "statTitles.likedMovies": "Liked Movies",
                "statTitles.likedTracks": "Liked Tracks",
                "statTitles.likedPlaylists": "Liked Playlists",
                "statTitles.likedAlbums": "Liked Albums",
                "statTitles.playlists": "Playlists",
                "statTitles.followers": "Followers",
                "statTitles.following": "Following",
                "statTitles.movieLists": "Movie Lists",
                "statTitles.likedMovieLists": "Liked Movie Lists",
                "statTitles.default": "Detail",
            };
            return enDict[key] || key;
        };

        expect(getStatTitle("watchlist", mockT)).toBe("Watchlist");
        expect(getStatTitle("watched", mockT)).toBe("Watched Movies");
        expect(getStatTitle("liked-movies", mockT)).toBe("Liked Movies");
        expect(getStatTitle("liked-tracks", mockT)).toBe("Liked Tracks");
        expect(getStatTitle("liked-playlists", mockT)).toBe("Liked Playlists");
        expect(getStatTitle("liked-albums", mockT)).toBe("Liked Albums");
        expect(getStatTitle("playlists", mockT)).toBe("Playlists");
        expect(getStatTitle("followers", mockT)).toBe("Followers");
        expect(getStatTitle("following", mockT)).toBe("Following");
        expect(getStatTitle("movie-lists", mockT)).toBe("Movie Lists");
        expect(getStatTitle("liked-movie-lists", mockT)).toBe("Liked Movie Lists");
    });

    it("returns default fallback title when statType is invalid or unknown", () => {
        const mockT = (key: string) => (key === "statTitles.default" ? "Detail" : key);
        expect(getStatTitle("" as StatType, mockT)).toBe("Detail");
        expect(getStatTitle("unknown" as StatType, mockT)).toBe("Detail");
    });

    it("maintains backward compatibility with legacy STAT_TITLES constant", () => {
        expect(STAT_TITLES.watchlist).toBe("İzleme Listesi");
        expect(STAT_TITLES.followers).toBe("Takipçiler");
    });
});
