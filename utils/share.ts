import { Alert, Share } from "react-native";
import { t } from "i18next";
import { getOrCreateShortLink } from "@/services/shortLink.service";

export interface IShareContentOptions {
    title?: string;
    message?: string;
    url?: string;
    showErrorAlert?: boolean;
}

export interface IShareMovieListOptions {
    id: string;
    title: string;
}

export interface ISharePlaylistOptions {
    id: string;
    title: string;
}

export interface IShareAlbumOptions {
    id: string;
    title: string;
}

export interface IShareMovieOptions {
    id: string;
    title: string;
}

export interface IShareUserOptions {
    id: string;
    username: string;
}

export interface IShareArtistOptions {
    id: string;
    name: string;
}

/**
 * Checks if an error thrown during share represents an intentional user dismissal or cancellation.
 */
export const isUserCancellation = (error: unknown): boolean => {
    if (!error || typeof error !== "object") return false;
    const message = ((error as any).message || "").toLowerCase();
    return (
        message.includes("cancel") ||
        message.includes("dismiss") ||
        message.includes("user did not share")
    );
};

/**
 * Displays a localized alert when sharing encounters an unexpected system error.
 */
export const showShareErrorAlert = () => {
    Alert.alert(
        t("common.error", { defaultValue: "Hata" }),
        t("share.error", { defaultValue: "Paylaşım yapılırken bir hata oluştu. Lütfen tekrar deneyiniz." })
    );
};

/**
 * Generic content share utility using native device share sheet.
 */
export const shareContent = async (options: IShareContentOptions): Promise<boolean> => {
    try {
        const result = await Share.share({
            title: options.title,
            message: options.message || "",
            url: options.url,
        });
        return result.action === Share.sharedAction;
    } catch (error) {
        if (!isUserCancellation(error)) {
            console.error("Share error:", error);
            if (options.showErrorAlert !== false) {
                showShareErrorAlert();
            }
        }
        return false;
    }
};

/**
 * Shares a Movie List with formatted title and short web link.
 */
export const shareMovieList = async (list: IShareMovieListOptions): Promise<boolean> => {
    const shareUrl = await getOrCreateShortLink("movie_list", list.id);
    const message = t("share.movieListMessage", {
        title: list.title,
        url: shareUrl,
        defaultValue: `"${list.title}" film listesine Mensola'da göz atın!\n${shareUrl}`,
    });

    return shareContent({
        title: list.title,
        message,
        url: shareUrl,
    });
};

/**
 * Shares a Playlist with formatted title and short web link.
 */
export const sharePlaylist = async (list: ISharePlaylistOptions): Promise<boolean> => {
    const shareUrl = await getOrCreateShortLink("playlist", list.id);
    const message = t("share.playlistMessage", {
        title: list.title,
        url: shareUrl,
        defaultValue: `"${list.title}" çalma listesine Mensola'da göz atın!\n${shareUrl}`,
    });

    return shareContent({
        title: list.title,
        message,
        url: shareUrl,
    });
};

/**
 * Shares an Album with formatted title and web link.
 */
export const shareAlbum = async (album: IShareAlbumOptions): Promise<boolean> => {
    const shareUrl = `https://mensola.app/albums/${album.id}`;
    const message = t("share.albumMessage", {
        title: album.title,
        url: shareUrl,
        defaultValue: `"${album.title}" albümüne Mensola'da göz atın!\n${shareUrl}`,
    });

    return shareContent({
        title: album.title,
        message,
        url: shareUrl,
    });
};

/**
 * Shares a Movie with formatted title and web link.
 */
export const shareMovie = async (movie: IShareMovieOptions): Promise<boolean> => {
    const shareUrl = `https://mensola.app/movies/${movie.id}`;
    const message = t("share.movieMessage", {
        title: movie.title,
        url: shareUrl,
        defaultValue: `"${movie.title}" filmine Mensola'da göz atın!\n${shareUrl}`,
    });

    return shareContent({
        title: movie.title,
        message,
        url: shareUrl,
    });
};

/**
 * Shares a User Profile with formatted username and short web link.
 */
export const shareUserProfile = async (user: IShareUserOptions): Promise<boolean> => {
    const shareUrl = await getOrCreateShortLink("user", user.id);
    const message = t("share.userMessage", {
        username: user.username,
        url: shareUrl,
        defaultValue: `@${user.username} profilini Mensola'da inceleyin!\n${shareUrl}`,
    });

    return shareContent({
        title: `@${user.username}`,
        message,
        url: shareUrl,
    });
};

export const shareArtist = async (artist: IShareArtistOptions): Promise<boolean> => {
    const shareUrl = await getOrCreateShortLink("artist", artist.id);
    const message = t("share.artistMessage", {
        name: artist.name,
        url: shareUrl,
        defaultValue: `"${artist.name}" sanatçısına Mensola'da göz atın!\n${shareUrl}`,
    });

    return shareContent({
        title: artist.name,
        message,
        url: shareUrl,
    });
};

/**
 * Reusable React Hook wrapper for sharing content.
 */
export const useShare = () => {
    return {
        shareContent,
        shareMovieList,
        sharePlaylist,
        shareMovie,
        shareUserProfile,
        shareArtist,
    };
};
