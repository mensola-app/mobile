/**
 * Centralized External and Deep Link URL Constants
 *
 * Consolidates all static URLs, legal endpoints, social profiles,
 * and external media provider URL templates.
 */

export const LINKS = {
    // Official Website & Legal
    WEBSITE: "https://mensola.app",
    TERMS: "https://mensola.app/terms",
    PRIVACY_POLICY: "https://mensola.app/privacy-policy",

    // Social & Community
    SOCIAL_X: "https://x.com/mensolaapp",
    SOCIAL_INSTAGRAM: "https://instagram.com/mensola.app",
    DEVELOPER_PROFILE: "https://x.com/enescxx",

    // Third-party Attributions
    TMDB: "https://www.themoviedb.org",
    SPOTIFY_WEB: "https://www.spotify.com",

    // External Provider URL Generators
    spotify: {
        artist: (id: string) => `https://open.spotify.com/artist/${id}`,
        album: (id: string) => `https://open.spotify.com/album/${id}`,
        track: (id: string) => `https://open.spotify.com/track/${id}`,
        playlist: (id: string) => `https://open.spotify.com/playlist/${id}`,
    },

    // Mensola Canonical Web Deep Links
    app: {
        shortLink: (code: string) => `https://mensola.app/${code}`,
        entity: (route: string, id: string) => `https://mensola.app/${route}/${id}`,
        movie: (id: string | number) => `https://mensola.app/movies/${id}`,
        album: (id: string | number) => `https://mensola.app/albums/${id}`,
        track: (id: string | number) => `https://mensola.app/tracks/${id}`,
        artist: (id: string | number) => `https://mensola.app/artists/${id}`,
        user: (usernameOrId: string) => `https://mensola.app/users/${usernameOrId}`,
        playlist: (id: string | number) => `https://mensola.app/playlists/${id}`,
        movieList: (id: string | number) => `https://mensola.app/movie-lists/${id}`,
    },
} as const;
