import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";

import { IMusicCardProps } from "./types";
import { styles } from "./styles";
import { ITrack } from "@/types/track.types";
import { IAlbum } from "@/types/album.types";
import { IPlaylist } from "@/types/playlist.types";
import { useTranslation } from "react-i18next";

export default function MusicCard<
    TTrack extends Omit<ITrack, "id"> = Omit<ITrack, "id">,
    TAlbum extends Omit<IAlbum, "id"> = Omit<IAlbum, "id">,
    TPlaylist extends Omit<IPlaylist, "id"> = Omit<IPlaylist, "id">,
>({ layout = "vertical", compact = false, ...props }: IMusicCardProps<TTrack, TAlbum, TPlaylist>) {
    const { t } = useTranslation();
    const { type, data, onPress, style } = props;
    const isHorizontal = layout === "horizontal";
    function formatDuration(ms: number) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;

        const formattedMinutes = String(minutes).padStart(2, "0");
        const formattedSeconds = String(remainingSeconds).padStart(2, "0");

        return `${formattedMinutes}:${formattedSeconds}`;
    }

    let subtitle: string | null;
    let albumTitle: string | null = null;
    let secondaryInfo: string | null;

    switch (type) {
        case "track": {
            const songData = data as Extract<IMusicCardProps, { type: "track" }>["data"];
            subtitle =
                songData.artists
                    ?.map((artist: any) => (typeof artist === "string" ? artist : artist?.name))
                    .filter(Boolean)
                    .join(", ") ??
                (songData as any)?.artistName ??
                null;
            albumTitle = isHorizontal && songData.album?.title ? songData.album.title : null;
            secondaryInfo = !compact && songData.duration ? `${formatDuration(songData.duration)}` : null;
            break;
        }
        case "album": {
            const albumData = data as Extract<IMusicCardProps, { type: "album" }>["data"];
            subtitle =
                albumData.artists
                    ?.map((artist: any) => (typeof artist === "string" ? artist : artist?.name))
                    .filter(Boolean)
                    .join(", ") ??
                (albumData as any)?.artistName ??
                null;
            secondaryInfo = !compact && albumData.releaseYear ? String(albumData.releaseYear) : null;
            break;
        }
        case "playlist": {
            const playlistProps = props as Extract<IMusicCardProps, { type: "playlist" }>;
            const playlistData = playlistProps.data;
            subtitle = playlistProps.hideCreator || !playlistData.creator ? "" : `@${playlistData.creator.username}`;
            secondaryInfo = !compact && playlistData.songCount ? `${playlistData.songCount} ${t("common.track")}` : null;
            break;
        }
    }

    const title = data.title || (data as any)?.name || "";
    const image = data.image;
    const fullSubtitle = [subtitle, secondaryInfo].filter(Boolean).join(" • ");

    return (
        <TouchableOpacity
            style={[isHorizontal ? styles.horizontalCard : styles.verticalCard, style]}
            onPress={onPress}
            activeOpacity={0.7}>
            <View
                style={[
                    styles.imageWrapper,
                    isHorizontal ? styles.horizontalImageWrapper : styles.verticalImageWrapper,
                ]}>
                <Image source={{ uri: image?.toString() }} style={styles.fullImage} />
            </View>
            <View style={[styles.infoWrapper, !isHorizontal && styles.verticalInfoWrapper]}>
                <Text style={[styles.mainTitle, compact && styles.compactMainTitle]} numberOfLines={1}>
                    {title}
                </Text>
                {albumTitle && isHorizontal && type === "track" && (
                    <Text style={styles.albumTitle} numberOfLines={1}>
                        {albumTitle}
                    </Text>
                )}
                {fullSubtitle ? (
                    <Text style={[styles.subTitle, compact && styles.compactSubTitle]} numberOfLines={1}>
                        {fullSubtitle}
                    </Text>
                ) : null}
            </View>
        </TouchableOpacity>
    );
}
