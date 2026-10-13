import React, { useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

import { IMusicCardProps } from "./types";
import { styles } from "./styles";
import { ITrack } from "@/types/track.types";
import { IAlbum } from "@/types/album.types";
import { IPlaylist } from "@/types/playlist.types";
import { useTranslation } from "react-i18next";

function formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

function MusicCardComponent<
    TTrack extends Omit<ITrack, "id"> = Omit<ITrack, "id">,
    TAlbum extends Omit<IAlbum, "id"> = Omit<IAlbum, "id">,
    TPlaylist extends Omit<IPlaylist, "id"> = Omit<IPlaylist, "id">,
>({ layout = "vertical", compact = false, ...props }: IMusicCardProps<TTrack, TAlbum, TPlaylist>) {
    const { t } = useTranslation();
    const { type, data, onPress, style } = props;
    const isHorizontal = layout === "horizontal";

    const { subtitle, albumTitle, secondaryInfo, title, rawCoverImage, trackImages, rawImage } = useMemo(() => {
        let sub: string | null = null;
        let albTitle: string | null = null;
        let sec: string | null = null;

        switch (type) {
            case "track": {
                const songData = data as Extract<IMusicCardProps, { type: "track" }>["data"];
                sub =
                    songData.artists
                        ?.map((artist: any) => (typeof artist === "string" ? artist : artist?.name))
                        .filter(Boolean)
                        .join(", ") ??
                    (songData as any)?.artistName ??
                    null;
                albTitle = isHorizontal && songData.album?.title ? songData.album.title : null;
                sec = !compact && songData.duration ? formatDuration(songData.duration) : null;
                break;
            }
            case "album": {
                const albumData = data as Extract<IMusicCardProps, { type: "album" }>["data"];
                sub =
                    albumData.artists
                        ?.map((artist: any) => (typeof artist === "string" ? artist : artist?.name))
                        .filter(Boolean)
                        .join(", ") ??
                    (albumData as any)?.artistName ??
                    null;
                sec = !compact && albumData.releaseYear ? String(albumData.releaseYear) : null;
                break;
            }
            case "playlist": {
                const playlistProps = props as Extract<IMusicCardProps, { type: "playlist" }>;
                const playlistData = playlistProps.data as any;
                sub = playlistProps.hideCreator || !playlistData.creator ? "" : `@${playlistData.creator.username}`;
                const count =
                    playlistData.songCount ??
                    playlistData.tracks?.length ??
                    playlistData.previewImages?.length;
                sec = count !== undefined && count !== null ? `${count} ${t("common.track")}` : null;
                break;
            }
        }

        const tTitle = data.title || (data as any)?.name || "";

        let rawCover: string | null = null;
        let trkImages: string[] = [];
        let rImage: string | null = null;

        if (type === "playlist") {
            const playlistProps = props as Extract<IMusicCardProps, { type: "playlist" }>;
            const playlistData = playlistProps.data as any;
            rawCover = playlistData.image ? playlistData.image.toString() : null;
            trkImages = (
                playlistData.previewImages ||
                playlistData.tracks?.map((tItem: any) => tItem.image).filter(Boolean) ||
                []
            ).filter(Boolean);
        } else {
            rImage = data.image ? data.image.toString() : null;
        }

        return {
            subtitle: sub,
            albumTitle: albTitle,
            secondaryInfo: sec,
            title: tTitle,
            rawCoverImage: rawCover,
            trackImages: trkImages,
            rawImage: rImage,
        };
    }, [props, type, data, isHorizontal, compact, t]);

    const fullSubtitle = useMemo(() => {
        return [subtitle, secondaryInfo].filter(Boolean).join(" • ");
    }, [subtitle, secondaryInfo]);

    const coverContent = useMemo(() => {
        if (type === "playlist") {
            if (rawCoverImage) {
                return (
                    <Image
                        source={{ uri: rawCoverImage }}
                        style={styles.fullImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={150}
                    />
                );
            }
            if (trackImages.length === 0) {
                return (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="musical-notes-outline" size={32} color={Colors.textMuted} />
                    </View>
                );
            }
            if (trackImages.length < 4) {
                return (
                    <Image
                        source={{ uri: trackImages[0] }}
                        style={styles.fullImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={150}
                    />
                );
            }
            return (
                <View style={styles.gridContainer}>
                    {trackImages.slice(0, 4).map((imgUri: string, idx: number) => (
                        <Image
                            key={idx}
                            source={{ uri: imgUri }}
                            style={styles.gridImage}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={150}
                        />
                    ))}
                </View>
            );
        }

        if (rawImage) {
            return (
                <Image
                    source={{ uri: rawImage }}
                    style={styles.fullImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={150}
                />
            );
        }

        return (
            <View style={styles.placeholderContainer}>
                <Ionicons
                    name={type === "album" ? "disc-outline" : "musical-note-outline"}
                    size={32}
                    color={Colors.textMuted}
                />
            </View>
        );
    }, [type, rawCoverImage, trackImages, rawImage]);

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

const MusicCard = React.memo(MusicCardComponent) as typeof MusicCardComponent;
export default MusicCard;
