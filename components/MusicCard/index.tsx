import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

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
            const playlistData = playlistProps.data as any;
            subtitle = playlistProps.hideCreator || !playlistData.creator ? "" : `@${playlistData.creator.username}`;
            const count =
                playlistData.songCount ??
                playlistData.tracks?.length ??
                playlistData.previewImages?.length;
            secondaryInfo = count !== undefined && count !== null ? `${count} ${t("common.track")}` : null;
            break;
        }
    }

    const title = data.title || (data as any)?.name || "";
    const fullSubtitle = [subtitle, secondaryInfo].filter(Boolean).join(" • ");

    let coverContent: React.ReactNode = null;

    if (type === "playlist") {
        const playlistProps = props as Extract<IMusicCardProps, { type: "playlist" }>;
        const playlistData = playlistProps.data as any;
        const rawCoverImage = playlistData.image ? playlistData.image.toString() : null;

        const trackImages: string[] = (
            playlistData.previewImages ||
            playlistData.tracks?.map((t: any) => t.image).filter(Boolean) ||
            []
        ).filter(Boolean);

        if (rawCoverImage) {
            coverContent = <Image source={{ uri: rawCoverImage }} style={styles.fullImage} />;
        } else if (trackImages.length === 0) {
            coverContent = (
                <View style={styles.placeholderContainer}>
                    <Ionicons name="musical-notes-outline" size={32} color={Colors.textMuted} />
                </View>
            );
        } else if (trackImages.length < 4) {
            coverContent = <Image source={{ uri: trackImages[0] }} style={styles.fullImage} />;
        } else {
            coverContent = (
                <View style={styles.gridContainer}>
                    {trackImages.slice(0, 4).map((imgUri: string, idx: number) => (
                        <Image key={idx} source={{ uri: imgUri }} style={styles.gridImage} resizeMode="cover" />
                    ))}
                </View>
            );
        }
    } else {
        const rawImage = data.image ? data.image.toString() : null;
        if (rawImage) {
            coverContent = <Image source={{ uri: rawImage }} style={styles.fullImage} />;
        } else {
            coverContent = (
                <View style={styles.placeholderContainer}>
                    <Ionicons
                        name={type === "album" ? "disc-outline" : "musical-note-outline"}
                        size={32}
                        color={Colors.textMuted}
                    />
                </View>
            );
        }
    }

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
                {coverContent}
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
