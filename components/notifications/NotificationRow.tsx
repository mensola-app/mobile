import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { NotificationRowProps } from "./types";
import { styles } from "./styles";
import { Colors } from "@/constants/colors";
import { formatRelativeTime } from "@/utils/date.utils";

export default function NotificationRow({ item, onPress, onPressActor }: NotificationRowProps) {
    const { t, i18n } = useTranslation();
    const { actor, type, createdAt, isRead, target, message } = item;
    const formattedTime = formatRelativeTime(createdAt, i18n.language);

    const handlePress = () => {
        onPress?.(item);
    };

    const handleActorPress = () => {
        if (onPressActor) {
            onPressActor(actor.id);
        } else {
            onPress?.(item);
        }
    };

    const renderBadge = () => {
        switch (type) {
            case "follow":
                return (
                    <View style={[styles.badgeIcon, styles.badgeFollow]}>
                        <Ionicons name="person" size={10} color="#FFFFFF" />
                    </View>
                );
            case "like":
                return (
                    <View style={[styles.badgeIcon, styles.badgeLike]}>
                        <Ionicons name="heart" size={10} color="#FFFFFF" />
                    </View>
                );
            case "review":
            case "comment":
                return (
                    <View style={[styles.badgeIcon, styles.badgeComment]}>
                        <Ionicons name="chatbubble" size={10} color="#FFFFFF" />
                    </View>
                );
            default:
                return null;
        }
    };

    const getDefaultMessage = () => {
        if (message) return message;
        if (type === "follow") {
            return t("notifications.startedFollowing");
        }
        if (type === "like") {
            if (target?.type === "playlist") {
                return t("notifications.likedYourPlaylist");
            }
            if (target?.type === "movie_list") {
                return t("notifications.likedYourMovieList");
            }
            if (target?.type === "comment") {
                return t("notifications.likedYourComment");
            }
            return t("notifications.likedYourReview");
        }
        if (type === "review" || type === "comment") {
            return t("notifications.reviewedContent");
        }
        return "";
    };

    return (
        <TouchableOpacity
            style={[styles.row, !isRead && styles.unreadRow]}
            onPress={handlePress}
            activeOpacity={0.7}
            testID={`notification-row-${item.id}`}>
            {/* Actor Avatar with Type Badge */}
            <TouchableOpacity onPress={handleActorPress} activeOpacity={0.7} style={styles.avatarContainer}>
                {actor.avatar ? (
                    <Image source={{ uri: actor.avatar }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>
                            {actor.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                {renderBadge()}
            </TouchableOpacity>

            {/* Notification Text Content */}
            <View style={styles.contentContainer}>
                <Text style={styles.messageText} numberOfLines={2}>
                    <Text style={styles.actorName}>{actor.fullName || actor.username} </Text>
                    {getDefaultMessage()}
                </Text>
                {formattedTime ? <Text style={styles.timeText}>{formattedTime}</Text> : null}
            </View>

            {/* Target Media Thumbnail or Placeholder Icon (if applicable) */}
            {target?.image ? (
                <Image source={{ uri: target.image }} style={styles.targetThumbnail} />
            ) : target?.type === "movie_list" ? (
                <View style={[styles.targetThumbnail, styles.targetPlaceholder]}>
                    <Ionicons name="film-outline" size={18} color={Colors.textMuted} />
                </View>
            ) : target?.type === "playlist" ? (
                <View style={[styles.targetThumbnail, styles.targetPlaceholder]}>
                    <Ionicons name="musical-notes-outline" size={18} color={Colors.textMuted} />
                </View>
            ) : target?.type === "comment" ? (
                <View style={[styles.targetThumbnail, styles.targetPlaceholder]}>
                    <Ionicons name="chatbubble-outline" size={18} color={Colors.textMuted} />
                </View>
            ) : null}

            {/* Unread Indicator */}
            {!isRead ? <View style={styles.unreadDot} /> : null}
        </TouchableOpacity>
    );
}
