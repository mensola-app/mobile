import { StatType } from "@/types/stat.types";

export const getStatTitles = (t: (key: string, options?: any) => string): Record<StatType, string> => ({
    watchlist: t("statTitles.watchlist", { defaultValue: "İzleme Listesi" }),
    watched: t("statTitles.watched", { defaultValue: "İzlenen Filmler" }),
    "liked-movies": t("statTitles.likedMovies", { defaultValue: "Beğenilen Filmler" }),
    "liked-tracks": t("statTitles.likedTracks", { defaultValue: "Beğenilen Şarkılar" }),
    "liked-playlists": t("statTitles.likedPlaylists", { defaultValue: "Beğenilen Çalma Listeleri" }),
    "liked-albums": t("statTitles.likedAlbums", { defaultValue: "Beğenilen Albümler" }),
    playlists: t("statTitles.playlists", { defaultValue: "Çalma Listeleri" }),
    followers: t("statTitles.followers", { defaultValue: "Takipçiler" }),
    following: t("statTitles.following", { defaultValue: "Takip Edilenler" }),
    "movie-lists": t("statTitles.movieLists", { defaultValue: "Film Listeleri" }),
    "liked-movie-lists": t("statTitles.likedMovieLists", { defaultValue: "Beğenilen Film Listeleri" }),
});

export const getStatTitle = (
    statType: StatType,
    t: (key: string, options?: any) => string
): string => {
    if (!statType) return t("statTitles.default", { defaultValue: "Detay" });
    const titles = getStatTitles(t);
    return titles[statType] || t("statTitles.default", { defaultValue: "Detay" });
};

/** @deprecated Use getStatTitle(statType, t) or getStatTitles(t) for i18n support */
export const STAT_TITLES: Record<StatType, string> = {
    watchlist: "İzleme Listesi",
    watched: "İzlenen Filmler",
    "liked-movies": "Beğenilen Filmler",
    "liked-tracks": "Beğenilen Şarkılar",
    "liked-playlists": "Beğenilen Çalma Listeleri",
    "liked-albums": "Beğenilen Albümler",
    playlists: "Çalma Listeleri",
    followers: "Takipçiler",
    following: "Takip Edilenler",
    "movie-lists": "Film Listeleri",
    "liked-movie-lists": "Beğenilen Film Listeleri",
};

