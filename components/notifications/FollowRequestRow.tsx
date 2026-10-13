import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { FollowRequestRowProps } from "./types";
import { styles } from "./styles";
import { formatRelativeTime } from "@/utils/date.utils";

export default function FollowRequestRow({
    item,
    onAccept,
    onDecline,
    onPressActor,
    isLoading = false,
}: FollowRequestRowProps) {
    const { t, i18n } = useTranslation();
    const { actor, createdAt, status = "pending" } = item;
    const formattedTime = formatRelativeTime(createdAt, i18n.language);

    const handleActorPress = () => {
        onPressActor?.(actor.id);
    };

    const handleAccept = () => {
        onAccept?.(item.id);
    };

    const handleDecline = () => {
        onDecline?.(item.id);
    };

    return (
        <TouchableOpacity
            style={styles.row}
            onPress={handleActorPress}
            activeOpacity={0.7}
            testID={`follow-request-row-${item.id}`}>
            {/* Avatar with Request Badge */}
            <View style={styles.avatarContainer}>
                {actor.avatar ? (
                    <Image
                        source={{ uri: actor.avatar }}
                        style={styles.avatar}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={150}
                    />
                ) : (
                    <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>
                            {actor.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={[styles.badgeIcon, styles.badgeRequest]}>
                    <Ionicons name="person-add" size={10} color="#FFFFFF" />
                </View>
            </View>

            {/* Content info */}
            <View style={styles.contentContainer}>
                <Text style={styles.actorName} numberOfLines={1}>
                    {actor.fullName || actor.username}
                </Text>
                <Text style={styles.messageText} numberOfLines={1}>
                    {t("notifications.wantsToFollow")}
                </Text>
                {formattedTime ? <Text style={styles.timeText}>{formattedTime}</Text> : null}
            </View>

            {/* Actions / Status */}
            <View style={styles.actionsContainer}>
                {status === "accepted" ? (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>{t("notifications.accepted")}</Text>
                    </View>
                ) : status === "declined" ? (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>{t("notifications.declined")}</Text>
                    </View>
                ) : isLoading ? (
                    <ActivityIndicator size="small" color="#FF8000" />
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={handleAccept}
                            activeOpacity={0.8}
                            testID={`accept-request-${item.id}`}>
                            <Text style={styles.acceptButtonText}>{t("notifications.accept")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.declineButton}
                            onPress={handleDecline}
                            activeOpacity={0.8}
                            testID={`decline-request-${item.id}`}>
                            <Text style={styles.declineButtonText}>{t("notifications.decline")}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
}
