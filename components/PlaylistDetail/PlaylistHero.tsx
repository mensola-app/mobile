import { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";

import ActionButton from "@/components/Movies/ActionButton";
import Badge from "@/components/Badge";
import PlaylistOwnersBottomSheet from "./PlaylistOwnersBottomSheet";
import { styles } from "./styles";
import { IPlaylistHeroProps } from "./types";
import { sharePlaylist } from "@/utils/share";
import { Colors } from "@/constants/colors";
import DetailHero from "@/components/DetailHero";

export default function PlaylistHero({
    playlistDetails,
    tracksCount,
    tracks,
    commentsCount,
    toggleLike,
    toggleSave,
    onCommentPress,
    onSharePress,
}: IPlaylistHeroProps) {
    const [isOwnersSheetVisible, setIsOwnersSheetVisible] = useState(false);

    if (!playlistDetails) return null;

    const owners = playlistDetails.owners || [];
    const creator = playlistDetails.creator || owners.find((o) => o.id === playlistDetails.creatorId) || owners[0];
    const creatorName = creator ? creator.fullname || creator.username : "";
    const othersCount = owners.length > 1 ? owners.length - 1 : 0;
    const ownerText = othersCount > 0 ? `${creatorName} ve ${othersCount} diğer yönetici` : creatorName;
    const likesCount = playlistDetails.likesCount || 0;

    const isSaved = playlistDetails?.isSaved ?? false;
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
            <DetailHero.Cover
                imageUri={playlistDetails.image.toString()}
                aspectRatio={1}
            />
        );
    } else if (trackImages.length === 0) {
        heroCoverContent = (
            <DetailHero.Cover
                placeholderIcon="musical-notes-outline"
                aspectRatio={1}
            />
        );
    } else if (trackImages.length < 4) {
        heroCoverContent = (
            <DetailHero.Cover
                imageUri={trackImages[0]}
                aspectRatio={1}
            />
        );
    } else {
        heroCoverContent = (
            <DetailHero.Cover aspectRatio={1}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", width: "100%", height: "100%", overflow: "hidden" }}>
                    {trackImages.slice(0, 4).map((imgUri, idx) => (
                        <Image key={idx} source={{ uri: imgUri }} style={{ width: "50%", height: "50%" }} resizeMode="cover" />
                    ))}
                </View>
            </DetailHero.Cover>
        );
    }

    return (
        <>
            <DetailHero
                bannerImageUri={bannerImageUri}
                cover={heroCoverContent}
                title={playlistDetails.title}
                subtitle={
                    creator ? (
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
                    ) : null
                }
                stats={
                    <>
                        <Badge
                            icon={<Ionicons name="musical-note-outline" size={12} color="#FF8000" />}
                            value={playlistDetails.songCount ?? tracksCount}
                        />
                        <Badge icon={<Ionicons name="heart" size={12} color="#FF8000" />} value={likesCount} />
                        <Badge icon={<Entypo name="text" size={12} color="#FF8000" />} value={commentsCount ?? 0} />
                        <Badge
                            icon={<Ionicons name="bookmark" size={12} color="#FF8000" />}
                            value={playlistDetails.savesCount ?? 0}
                        />
                    </>
                }
                actions={
                    <>
                        {/* 1. Yer İmi (Kaydet) */}
                        <ActionButton
                            icon={isSaved ? "bookmark" : "bookmark-outline"}
                            isActive={isSaved}
                            activeColor={`${Colors.warning}66`}
                            onPress={toggleSave}
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
                    </>
                }
                description={playlistDetails.description}
            />

            <PlaylistOwnersBottomSheet
                isVisible={isOwnersSheetVisible}
                onClose={() => setIsOwnersSheetVisible(false)}
                owners={owners}
            />
        </>
    );
}
