import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import { Colors } from "@/constants/colors";
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
    isLikedByMe?: boolean;
    onLike?: () => void;
}

function formatDate(date: Date | string | undefined): string {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

const mediaTypeLabels: Record<string, string> = {
    movie: "Film",
    track: "Parça",
    playlist: "Çalma Listesi",
    album: "Albüm",
    movieList: "Film Listesi",
};

export default function HeroHeader({
    mediaPoster,
    mediaTitle,
    mediaType,
    interaction,
    likeCount,
    isLikedByMe,
    onLike,
}: HeroHeaderProps) {
    const { user, comment, rating, isLiked } = interaction;
    const typeLabel = mediaType ? (mediaTypeLabels[mediaType] ?? mediaType) : undefined;

    const displayLikeCount = likeCount ?? 0;

    return (
        <View style={styles.heroCard}>
            {/* ── Media context row ── */}
            {(mediaPoster || mediaTitle) ? (
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

            {/* ── Root interaction card ── */}
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
                        {isLiked ? (
                            <View style={styles.heroBadge}>
                                <Ionicons name="heart" size={12} color="#FF8000" />
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Comment text */}
                <Text style={styles.heroComment}>{comment.content}</Text>

                {/* Date + like action */}
                <View style={styles.heroActionsRow}>
                    <Text style={styles.heroDate}>{formatDate(comment.date)}</Text>
                    <TouchableOpacity
                        style={[styles.heroLikeBtn, isLikedByMe && styles.heroLikeBtnActive]}
                        activeOpacity={0.8}
                        onPress={onLike}>
                        <Ionicons
                            name={isLikedByMe ? "heart" : "heart-outline"}
                            size={14}
                            color={isLikedByMe ? Colors.danger : Colors.textSecondary}
                        />
                        {displayLikeCount > 0 ? (
                            <Text style={[styles.heroLikeText, isLikedByMe && styles.heroLikeTextActive]}>
                                {displayLikeCount}
                            </Text>
                        ) : null}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
