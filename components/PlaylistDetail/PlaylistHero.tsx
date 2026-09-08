import { useState } from "react";
import {
    View,
    Text,
    Image,
    ImageBackground,
    TouchableOpacity,
    NativeSyntheticEvent,
    TextLayoutEventData,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Ionicons } from "@expo/vector-icons";

import ActionButton from "@/components/Movies/ActionButton";
import Badge from "@/components/Badge";
import PlaylistOwnersBottomSheet from "./PlaylistOwnersBottomSheet";
import { styles } from "./styles";
import { IPlaylistHeroProps } from "./types";
import { sharePlaylist } from "@/utils/share";
import { Colors } from "@/constants/colors";

export default function PlaylistHero({
    playlistDetails,
    tracksCount,
    tracks,
    commentsCount,
    toggleLike,
    onCommentPress,
    onSharePress,
}: IPlaylistHeroProps) {
    const [isOwnersSheetVisible, setIsOwnersSheetVisible] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);

    if (!playlistDetails) return null;

    const owners = playlistDetails.owners || [];
    const creator = playlistDetails.creator || owners.find((o) => o.id === playlistDetails.creatorId) || owners[0];
    const creatorName = creator ? creator.fullname || creator.username : "";
    const othersCount = owners.length > 1 ? owners.length - 1 : 0;
    const ownerText = othersCount > 0 ? `${creatorName} ve ${othersCount} diğer yönetici` : creatorName;
    const likesCount = playlistDetails.likesCount || 0;
    const userRating = playlistDetails?.currentUserInteraction?.rating
        ? Number(playlistDetails.currentUserInteraction.rating)
        : 0;
    const userComment = playlistDetails?.currentUserInteraction?.comment?.content || "";
    const hasUserInteraction = userRating > 0 || (typeof userComment === "string" && userComment.trim().length > 0);

    const trackImages: string[] = (
        tracks?.map((t) => t.image).filter(Boolean) ||
        playlistDetails.previewImages ||
        []
    ).filter(Boolean) as string[];

    const bannerImageUri =
        (playlistDetails.image ? playlistDetails.image.toString() : null) ||
        (trackImages.length > 0 ? trackImages[0] : null);

    const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (e.nativeEvent.lines.length > 2 && !isDescriptionTruncated) {
            setIsDescriptionTruncated(true);
        }
    };

    const handleShare = async () => {
        if (onSharePress) {
            onSharePress();
            return;
        }

        if (!playlistDetails) return;

        await sharePlaylist({
            id: playlistDetails.id,
            title: playlistDetails.title,
        });
    };

    let heroCoverContent: React.ReactNode = null;
    if (playlistDetails.image) {
        heroCoverContent = (
            <Image
                source={{ uri: playlistDetails.image.toString() }}
                style={styles.poster}
                resizeMode="cover"
            />
        );
    } else if (trackImages.length === 0) {
        heroCoverContent = (
            <View style={[styles.poster, styles.posterPlaceholder]}>
                <Ionicons name="musical-notes-outline" size={36} color={Colors.textSecondary} />
            </View>
        );
    } else if (trackImages.length < 4) {
        heroCoverContent = (
            <Image
                source={{ uri: trackImages[0] }}
                style={styles.poster}
                resizeMode="cover"
            />
        );
    } else {
        heroCoverContent = (
            <View style={[styles.poster, { flexDirection: "row", flexWrap: "wrap", overflow: "hidden" }]}>
                {trackImages.slice(0, 4).map((imgUri, idx) => (
                    <Image key={idx} source={{ uri: imgUri }} style={{ width: "50%", height: "50%" }} resizeMode="cover" />
                ))}
            </View>
        );
    }

    return (
        <>
            <View style={styles.heroBanner}>
                {bannerImageUri ? (
                    <ImageBackground
                        style={styles.bannerBackgroundImg}
                        source={{ uri: bannerImageUri }}>
                        <LinearGradient
                            colors={["transparent", "rgba(8, 12, 18, 0.8)", Colors.background]}
                            style={styles.bannerGradient}
                        />
                    </ImageBackground>
                ) : (
                    <View style={[styles.bannerBackgroundImg, { backgroundColor: Colors.surface }]}>
                        <LinearGradient
                            colors={["transparent", "rgba(8, 12, 18, 0.8)", Colors.background]}
                            style={styles.bannerGradient}
                        />
                    </View>
                )}

                <View style={styles.bannerContent}>
                    <View style={styles.posterWrapper}>
                        {heroCoverContent}
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.titleWrapper}>
                            <Text style={styles.movieTitle} numberOfLines={2}>
                                {playlistDetails.title}
                            </Text>
                        </View>

                        {creator && (
                            <TouchableOpacity
                                style={styles.creatorContainer}
                                onPress={() => setIsOwnersSheetVisible(true)}
                                activeOpacity={0.8}>
                                {creator.avatar ? (
                                    <Image source={{ uri: creator.avatar.toString() }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                        <Text style={styles.avatarLetter}>
                                            {(creatorName || "U").charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <Text style={styles.creatorName} numberOfLines={1}>
                                    {ownerText}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.movieStats}>
                            <Badge
                                icon={<Ionicons name="musical-note-outline" size={12} color="#FF8000" />}
                                value={tracksCount}
                            />
                            <Badge icon={<Ionicons name="heart" size={12} color="#FF8000" />} value={likesCount} />
                            <Badge icon={<Entypo name="text" size={12} color="#FF8000" />} value={commentsCount ?? 0} />
                            <Badge
                                icon={<Ionicons name="bookmark" size={12} color="#FF8000" />}
                                value={playlistDetails.savesCount ?? 0}
                            />
                        </View>

                        <View style={styles.actionBar}>
                            {/* Aktar */}
                            <ActionButton
                                icon="arrow-redo"
                                isActive={false}
                                activeColor={`${Colors.secondary}66`}
                                onPress={() => {}}
                            />

                            {/* Paylaş */}
                            <ActionButton
                                icon="share-social-outline"
                                isActive={false}
                                activeColor={`${Colors.primary}66`}
                                onPress={handleShare}
                            />

                            {/* Beğen */}
                            <ActionButton
                                icon="heart"
                                isActive={!!playlistDetails.isLiked}
                                activeColor={`${Colors.accentPink}66`}
                                onPress={toggleLike}
                            />

                            {/* Puanla / Yorum Yap */}
                            <ActionButton
                                icon="star"
                                isActive={hasUserInteraction}
                                activeColor={`${Colors.warning}66`}
                                onPress={onCommentPress}
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* Description */}
            {playlistDetails.description ? (
                <View style={styles.descriptionSection}>
                    <Text
                        style={styles.description}
                        numberOfLines={isDescriptionExpanded ? undefined : 2}
                        onTextLayout={handleTextLayout}>
                        {playlistDetails.description}
                    </Text>

                    {(isDescriptionTruncated || isDescriptionExpanded) && (
                        <TouchableOpacity
                            onPress={() => setIsDescriptionExpanded((prev) => !prev)}
                            activeOpacity={0.7}
                            style={styles.readMoreButton}>
                            <Text style={styles.readMoreText}>{isDescriptionExpanded ? "Daha Az" : "Daha Fazla"}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : null}

            <PlaylistOwnersBottomSheet
                isVisible={isOwnersSheetVisible}
                onClose={() => setIsOwnersSheetVisible(false)}
                owners={owners}
            />
        </>
    );
}
