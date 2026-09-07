import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import { styles } from "./styles";
import ProfileStats from "./ProfileStats";

import { useProfileContext } from "../../context/ProfileContext";
import { useFollow } from "@/hooks/user/useFollow";
import { shareUserProfile } from "@/utils/share";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Avatar from "../Avatar";
import { Colors } from "@/constants/colors";
import { notificationService } from "@/services/notification.service";

export default function ProfileHeader() {
    const router = useRouter();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { headerData, bodyData, handleStatPress, refetch } = useProfileContext();
    const { followHandler, unfollowHandler, isLoading } = useFollow();
    const [isHandlingRequest, setIsHandlingRequest] = useState(false);

    const isFollowing = headerData.isFollowingByMe;
    const isPending = headerData.isPendingByMe;

    const handleTasteCardPress = () => {
        const movies = bodyData?.favoriteMovies || [];
        const tracks = bodyData?.favoriteTracks || [];

        if (movies.length >= 3 && tracks.length >= 3) {
            router.push({
                pathname: "/taste-card",
                params: {
                    user: JSON.stringify({
                        id: headerData.id,
                        username: headerData.username,
                        fullname: headerData.fullname,
                        avatar: headerData.avatar,
                    }),
                    favoriteMovies: JSON.stringify(movies.slice(0, 3)),
                    favoriteTracks: JSON.stringify(tracks.slice(0, 3)),
                },
            });
        } else {
            Alert.alert(
                t("profile.tasteCard.requirementAlertTitle", { defaultValue: "Taste Card" }),
                t("profile.tasteCard.requirementAlertMessage", {
                    defaultValue: "Taste card'ı kullanmak için favorilerinizde 3 film ve 3 müzik olmalı.",
                }),
            );
        }
    };

    const handleAcceptFollowRequest = async () => {
        try {
            setIsHandlingRequest(true);
            await notificationService.acceptFollowRequest(headerData.id);
            headerData.hasPendingRequestFromUser = false;
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["homeData"] });
            await refetch();
        } catch (error) {
            console.error("Failed to accept follow request", error);
        } finally {
            setIsHandlingRequest(false);
        }
    };

    const handleDeclineFollowRequest = async () => {
        try {
            setIsHandlingRequest(true);
            await notificationService.declineFollowRequest(headerData.id);
            headerData.hasPendingRequestFromUser = false;
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["homeData"] });
            await refetch();
        } catch (error) {
            console.error("Failed to decline follow request", error);
        } finally {
            setIsHandlingRequest(false);
        }
    };

    return (
        <View style={styles.headerWrapper}>
            {headerData.hasPendingRequestFromUser ? (
                <View style={styles.followRequestBanner} testID="profile-follow-request-banner">
                    <View style={styles.followRequestBannerContent}>
                        <View style={styles.followRequestBannerIconWrapper}>
                            <Ionicons name="person-add" size={18} color={Colors.primary} />
                        </View>
                        <Text style={styles.followRequestBannerText} numberOfLines={2}>
                            {t("profile.followRequest.banner", {
                                name: headerData.fullname || headerData.username,
                            })}
                        </Text>
                    </View>

                    <View style={styles.followRequestBannerActions}>
                        <TouchableOpacity
                            style={styles.followRequestAcceptButton}
                            onPress={handleAcceptFollowRequest}
                            disabled={isHandlingRequest}
                            activeOpacity={0.8}
                            testID="profile-accept-follow-request">
                            {isHandlingRequest ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.followRequestAcceptButtonText}>
                                    {t("notifications.accept")}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.followRequestDeclineButton}
                            onPress={handleDeclineFollowRequest}
                            disabled={isHandlingRequest}
                            activeOpacity={0.8}
                            testID="profile-decline-follow-request">
                            <Text style={styles.followRequestDeclineButtonText}>
                                {t("notifications.decline")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}

            <LinearGradient
                colors={[Colors.primary, Colors.secondary, Colors.accentPink]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 3, borderRadius: 999 }}>
                <View style={{ borderRadius: 999, overflow: "hidden", borderWidth: 2, borderColor: Colors.background }}>
                    <Avatar url={headerData.avatar} user={{ ...headerData }} size={84} />
                </View>
            </LinearGradient>

            <View style={styles.nameBlock}>
                {headerData.fullname ? <Text style={styles.fullnameLabel}>{headerData.fullname}</Text> : null}
                <Text style={styles.usernameLabel}>@{headerData.username}</Text>
            </View>

            {headerData.bio ? <Text style={styles.userBio}>{headerData.bio}</Text> : null}

            <ProfileStats stats={headerData.stats} onStatPress={handleStatPress} />

            <View style={styles.actionButtonContainer}>
                {headerData.isOwnProfile ? (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push("/me/edit")}
                        style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>{t("profile.header.editProfileButton")}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={[
                            styles.actionButton,
                            (isFollowing || isPending) ? styles.actionButtonFollowing : styles.actionButtonPrimary,
                        ]}
                        onPress={async () => {
                            if (isLoading) return;
                            if (isPending) {
                                Alert.alert(
                                    t("profile.header.cancelRequestTitle"),
                                    t("profile.header.cancelRequestBody", { name: headerData.fullname || headerData.username }),
                                    [
                                        { text: t("profile.header.no"), style: "cancel" },
                                        {
                                            text: t("profile.header.yes"),
                                            onPress: () =>
                                                unfollowHandler(headerData.id, () => {
                                                    headerData.isPendingByMe = false;
                                                }),
                                        },
                                    ],
                                );
                            } else if (isFollowing) {
                                Alert.alert(
                                    t("profile.header.unfollowConfirmTitle"),
                                    t("profile.header.unfollowConfirmBody", { name: headerData.fullname || headerData.username }),
                                    [
                                        { text: t("profile.header.no"), style: "cancel" },
                                        {
                                            text: t("profile.header.yes"),
                                            onPress: () =>
                                                unfollowHandler(headerData.id, () => {
                                                    headerData.isFollowingByMe = false;
                                                }),
                                        },
                                    ],
                                );
                            } else {
                                await followHandler(headerData.id, (data) => {
                                    if (data?.status === "pending" || headerData.isPrivate) {
                                        headerData.isPendingByMe = true;
                                    } else {
                                        headerData.isFollowingByMe = true;
                                    }
                                });
                            }
                        }}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={(isFollowing || isPending) ? Colors.primary : "#fff"} />
                        ) : (
                            <Text style={[styles.actionButtonText, !(isFollowing || isPending) && styles.actionButtonTextPrimary]}>
                                {isFollowing
                                    ? t("profile.header.followingButton")
                                    : isPending
                                      ? t("profile.header.requestedButton")
                                      : t("profile.header.followButton")}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={async () => await shareUserProfile({ id: headerData.id, username: headerData.username })}
                    style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>{t("profile.header.shareButton")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleTasteCardPress}
                    style={styles.actionSquareButton}
                    testID="profile-taste-card-button"
                    accessibilityLabel="Taste Card">
                    <Ionicons name="sparkles" size={18} color={Colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
