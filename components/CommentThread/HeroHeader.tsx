import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Avatar from "@/components/Avatar";
import { Colors } from "@/constants/colors";
import { formatRelativeTime } from "@/utils/date.utils";
import { threadStyles as styles } from "./styles";
import { InteractionItemResponse } from "@/types/interaction.types";

interface HeroHeaderProps {
    /** Poster/cover URL of the media (movie, album, etc.) */
    mediaPoster?: string;
    mediaTitle?: string;
    mediaType?: string;
    /** The root interaction (top-level review/comment) */
    interaction: InteractionItemResponse;
    likeCount?: number;
    isLiked?: boolean;
    onLike?: () => void;
}

export default function HeroHeader({
    mediaPoster,
    mediaTitle,
    mediaType,
    interaction,
    likeCount,
    isLiked,
    onLike,
}: HeroHeaderProps) {
    const { t, i18n } = useTranslation();
    const { user, comment, rating, isLiked: interactionIsLiked } = interaction;
    const activeIsLiked = isLiked ?? interactionIsLiked ?? false;

    const getMediaTypeLabel = (type?: string): string => {
        if (!type) return "";
        switch (type) {
            case "movie":
                return t("common.movie", "Film");
            case "track":
                return t("common.track", "Şarkı");
            case "playlist":
                return t("common.playlist", "Çalma Listesi");
            case "album":
                return t("common.album", "Albüm");
            case "movieList":
                return t("common.movieList", "Film Listesi");
            default:
                return type;
        }
    };

    const typeLabel = getMediaTypeLabel(mediaType);
    const displayLikeCount = likeCount ?? 0;

    return (
        <View style={styles.heroCard}>
            {/* ── Media context row ── */}
            {mediaPoster || mediaTitle ? (
                <View style={styles.heroContextRow}>
                    {mediaPoster ? (
                        <View style={styles.heroPosterWrapper}>
                            <Image
                                source={{ uri: mediaPoster }}
                                style={styles.heroPoster}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        </View>
                    ) : null}
                    <View style={styles.heroContextInfo}>
                        {typeLabel ? <Text style={styles.heroMediaType}>{typeLabel}</Text> : null}
                        {mediaTitle ? (
                            <Text style={styles.heroMediaTitle} numberOfLines={2}>
                                {mediaTitle}
                            </Text>
                        ) : null}
                    </View>
                </View>
            ) : null}

            {/* ── Root interaction card (same design as InteractionView) ── */}
            <View style={styles.heroInteractionCard}>
                {/* User info + badges */}
                <View style={styles.heroUserRow}>
                    <TouchableOpacity style={styles.heroUserLeft} activeOpacity={0.8}>
                        <Avatar user={user} size={36} />
                        <View>
                            <Text style={styles.heroUserName}>{user.fullname || user.username}</Text>
                            <Text style={styles.heroUserHandle}>@{user.username}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.heroBadgesRow}>
                        {typeof rating === "number" && rating > 0 ? (
                            <View style={styles.heroBadge}>
                                <Ionicons name="star" size={12} color="#FF8000" />
                                <Text style={styles.heroBadgeText}>{rating}</Text>
                            </View>
                        ) : null}
                        {interaction.isLiked ? (
                            <View style={styles.heroBadge}>
                                <Ionicons name="heart" size={12} color="#FF8000" />
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Comment text inside styled container matching InteractionView */}
                <View style={styles.heroCommentContainer}>
                    <Text style={styles.heroComment}>{comment.content}</Text>
                </View>

                {/* Date + like & reply actions */}
                <View style={styles.heroActionsRow}>
                    <Text style={styles.heroDate}>{formatRelativeTime(comment.date, i18n.language)}</Text>
                    <View style={styles.heroActionButtons}>
                        <TouchableOpacity
                            style={[styles.heroLikeBtn, activeIsLiked && styles.heroLikeBtnActive]}
                            activeOpacity={0.8}
                            onPress={onLike}>
                            <Ionicons
                                name={activeIsLiked ? "heart" : "heart-outline"}
                                size={14}
                                color={activeIsLiked ? Colors.danger : Colors.primary}
                            />
                            <Text style={[styles.heroLikeText, activeIsLiked && styles.heroLikeTextActive]}>
                                {displayLikeCount}
                            </Text>
                        </TouchableOpacity>
                        {typeof interaction.replyCount === "number" ? (
                            <View style={styles.heroReplyBtn}>
                                <Ionicons
                                    name="chatbubble-outline"
                                    size={14}
                                    color={Colors.primary}
                                />
                                <Text style={styles.heroReplyText}>
                                    {interaction.replyCount}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>
        </View>
    );
}
