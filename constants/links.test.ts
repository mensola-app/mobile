import { LINKS } from "./links";

describe("LINKS Constants (constants/links.ts)", () => {
    it("defines valid legal and official URLs", () => {
        expect(LINKS.WEBSITE).toBe("https://mensola.app");
        expect(LINKS.TERMS).toBe("https://mensola.app/terms");
        expect(LINKS.PRIVACY_POLICY).toBe("https://mensola.app/privacy-policy");
    });

    it("defines valid social media URLs", () => {
        expect(LINKS.SOCIAL_X).toBe("https://x.com/mensolaapp");
        expect(LINKS.SOCIAL_INSTAGRAM).toBe("https://instagram.com/mensola.app");
        expect(LINKS.DEVELOPER_PROFILE).toBe("https://x.com/enescxx");
    });

    it("generates correct Spotify URLs", () => {
        expect(LINKS.spotify.artist("spotify-art-1")).toBe("https://open.spotify.com/artist/spotify-art-1");
        expect(LINKS.spotify.album("spotify-alb-2")).toBe("https://open.spotify.com/album/spotify-alb-2");
        expect(LINKS.spotify.track("spotify-trk-3")).toBe("https://open.spotify.com/track/spotify-trk-3");
        expect(LINKS.spotify.playlist("spotify-pl-4")).toBe("https://open.spotify.com/playlist/spotify-pl-4");
    });

    it("generates correct Mensola canonical web links", () => {
        expect(LINKS.app.shortLink("abcde")).toBe("https://mensola.app/abcde");
        expect(LINKS.app.movie(550)).toBe("https://mensola.app/movies/550");
        expect(LINKS.app.album("alb-123")).toBe("https://mensola.app/albums/alb-123");
        expect(LINKS.app.track("trk-456")).toBe("https://mensola.app/tracks/trk-456");
        expect(LINKS.app.artist("art-789")).toBe("https://mensola.app/artists/art-789");
        expect(LINKS.app.user("alice")).toBe("https://mensola.app/users/alice");
        expect(LINKS.app.playlist("pl-111")).toBe("https://mensola.app/playlists/pl-111");
        expect(LINKS.app.movieList("ml-222")).toBe("https://mensola.app/movie-lists/ml-222");
    });
});
