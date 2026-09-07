import React, { useRef, useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
    Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import Avatar from "@/components/Avatar";
import { Colors } from "@/constants/colors";
import { MovieSummaryViaInteraction } from "@/types/movie.types";
import { ITrack } from "@/types/track.types";
import { IUser } from "@/types/user.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 44, 350);
const ITEM_WIDTH = (CARD_WIDTH - 32 - 16) / 3;

export default function TasteCardModal() {
    const router = useRouter();
    const { t } = useTranslation();
    const params = useLocalSearchParams<{
        user?: string;
        favoriteMovies?: string;
        favoriteTracks?: string;
    }>();

    const cardRef = useRef<View>(null);
    const [isSharing, setIsSharing] = useState(false);

    const user: Partial<IUser> | null = useMemo(() => {
        try {
            return params.user ? JSON.parse(params.user) : null;
        } catch {
            return null;
        }
    }, [params.user]);

    const favoriteMovies: MovieSummaryViaInteraction[] = useMemo(() => {
        try {
            return params.favoriteMovies ? JSON.parse(params.favoriteMovies) : [];
        } catch {
            return [];
        }
    }, [params.favoriteMovies]);

    const favoriteTracks: ITrack[] = useMemo(() => {
        try {
            return params.favoriteTracks ? JSON.parse(params.favoriteTracks) : [];
        } catch {
            return [];
        }
    }, [params.favoriteTracks]);

    const handleShare = async () => {
        if (isSharing) return;

        try {
            setIsSharing(true);
            if (!cardRef.current) return;

            const uri = await captureRef(cardRef, {
                format: "png",
                quality: 1,
                result: "tmpfile",
            });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri, {
                    mimeType: "image/png",
                    dialogTitle: t("profile.tasteCard.shareDialogTitle", { defaultValue: "Taste Card Paylaş" }),
                    UTI: "public.png",
                });
            } else {
                Alert.alert(
                    t("profile.tasteCard.title", { defaultValue: "Taste Card" }),
                    t("profile.tasteCard.shareError", {
                        defaultValue: "Paylaşım bu cihazda desteklenmiyor.",
                    }),
                );
            }
        } catch (error) {
            console.error("Taste card capture error:", error);
            Alert.alert(
                t("profile.tasteCard.title", { defaultValue: "Taste Card" }),
                t("profile.tasteCard.shareError", {
                    defaultValue: "Taste Card paylaşılırken bir hata oluştu.",
                }),
            );
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <View style={styles.overlayContainer}>
            {/* Backdrop touch to close */}
            <Pressable style={styles.backdrop} onPress={() => router.back()} />

            <View style={styles.contentWrapper} pointerEvents="box-none">
                {/* Close Button Header */}
                <View style={styles.topActionsRow}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        testID="taste-card-close-button"
                        accessibilityLabel="Kapat">
                        <Ionicons name="close" size={22} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* 4:5 Taste Card */}
                <View style={styles.cardOuterWrapper}>
                    <View ref={cardRef} collapsable={false} style={styles.cardContainer}>
                        <LinearGradient
                            colors={["#141D2F", "#0E1524", "#090D16"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.8, y: 1 }}
                            style={styles.cardGradient}>
                            {/* Card Header: User info on left, App branding on right */}
                            <View style={styles.cardHeader}>
                                <View style={styles.userSection}>
                                    <View style={styles.avatarBorder}>
                                        <Avatar
                                            url={user?.avatar}
                                            name={user?.fullname || user?.username}
                                            user={user && user.id && user.username ? (user as IUser) : undefined}
                                            size={42}
                                        />
                                    </View>
                                    <View style={styles.userTextContainer}>
                                        {user?.fullname ? (
                                            <Text style={styles.userFullname} numberOfLines={1}>
                                                {user.fullname}
                                            </Text>
                                        ) : null}
                                        <Text style={styles.userHandle} numberOfLines={1}>
                                            @{user?.username || "user"}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.appSection}>
                                    <Image
                                        source={require("../assets/images/icon.png")}
                                        style={styles.appIcon}
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.appName}>Mensola</Text>
                                </View>
                            </View>

                            <View style={styles.headerDivider} />

                            {/* Movies Section: Clean posters, NO badges */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeaderRow}>
                                    <Ionicons name="film-outline" size={13} color={Colors.primary} />
                                    <Text style={styles.sectionTitle}>
                                        {t("profile.tasteCard.movies", { defaultValue: "FAVORİ FİLMLER" })}
                                    </Text>
                                </View>
                                <View style={styles.itemsGrid}>
                                    {favoriteMovies.slice(0, 3).map((movie, index) => (
                                        <View key={movie.id || `movie-${index}`} style={styles.itemColumn}>
                                            <View style={styles.moviePosterWrapper}>
                                                {movie.poster ? (
                                                    <Image
                                                        source={{ uri: movie.poster }}
                                                        style={styles.moviePoster}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View style={styles.placeholderPoster}>
                                                        <Ionicons name="film-outline" size={24} color={Colors.textMuted} />
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.itemTitle} numberOfLines={1}>
                                                {movie.title}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Tracks Section */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeaderRow}>
                                    <Ionicons name="musical-notes-outline" size={13} color={Colors.secondary} />
                                    <Text style={styles.sectionTitle}>
                                        {t("profile.tasteCard.tracks", { defaultValue: "FAVORİ ŞARKILAR" })}
                                    </Text>
                                </View>
                                <View style={styles.itemsGrid}>
                                    {favoriteTracks.slice(0, 3).map((track, index) => {
                                        const artistName = track.artists?.map((a) => a.name).join(", ");
                                        const imageUrl = track.image ? track.image.toString() : undefined;

                                        return (
                                            <View key={track.id || `track-${index}`} style={styles.itemColumn}>
                                                <View style={styles.trackImageWrapper}>
                                                    {imageUrl ? (
                                                        <Image
                                                            source={{ uri: imageUrl }}
                                                            style={styles.trackImage}
                                                            resizeMode="cover"
                                                        />
                                                    ) : (
                                                        <View style={styles.placeholderTrack}>
                                                            <Ionicons name="musical-note-outline" size={22} color={Colors.textMuted} />
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.itemTitle} numberOfLines={1}>
                                                    {track.title}
                                                </Text>
                                                <Text style={styles.itemSubtitle} numberOfLines={1}>
                                                    {artistName || "—"}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Card Footer Branding */}
                            <View style={styles.cardFooter}>
                                <LinearGradient
                                    colors={[Colors.primary, Colors.secondary, Colors.accentPink]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.brandingLine}
                                />
                                <Text style={styles.brandingText}>mensola.app</Text>
                            </View>
                        </LinearGradient>
                    </View>
                </View>

                {/* Share Button Under the Card */}
                <View style={styles.shareActionContainer}>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShare}
                        disabled={isSharing}
                        activeOpacity={0.8}
                        testID="taste-card-share-button">
                        <LinearGradient
                            colors={[Colors.primary, Colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.shareButtonGradient}>
                            {isSharing ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.shareButtonText}>
                                        {t("profile.tasteCard.shareButton", { defaultValue: "Fotoğraf Olarak Paylaş" })}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        justifyContent: "center",
        alignItems: "center",
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    contentWrapper: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    topActionsRow: {
        width: CARD_WIDTH,
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 10,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        justifyContent: "center",
        alignItems: "center",
    },
    cardOuterWrapper: {
        width: CARD_WIDTH,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    cardContainer: {
        width: CARD_WIDTH,
        aspectRatio: 4 / 5,
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
    },
    cardGradient: {
        flex: 1,
        padding: 16,
        justifyContent: "space-between",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    avatarBorder: {
        borderRadius: 999,
        padding: 2,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    userTextContainer: {
        flex: 1,
        justifyContent: "center",
    },
    userFullname: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
    userHandle: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: "500",
    },
    appSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },
    appIcon: {
        width: 20,
        height: 20,
        borderRadius: 5,
    },
    appName: {
        color: Colors.textPrimary,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    headerDivider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        marginVertical: 4,
    },
    sectionContainer: {
        gap: 8,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.textSecondary,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    itemsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
    },
    itemColumn: {
        width: ITEM_WIDTH,
        gap: 4,
    },
    moviePosterWrapper: {
        width: ITEM_WIDTH,
        aspectRatio: 2 / 3,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },
    moviePoster: {
        width: "100%",
        height: "100%",
    },
    placeholderPoster: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.surface,
    },
    trackImageWrapper: {
        width: ITEM_WIDTH,
        aspectRatio: 1,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },
    trackImage: {
        width: "100%",
        height: "100%",
    },
    placeholderTrack: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.surface,
    },
    itemTitle: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.textPrimary,
    },
    itemSubtitle: {
        fontSize: 10,
        color: Colors.textSecondary,
    },
    cardFooter: {
        alignItems: "center",
        gap: 6,
        paddingTop: 4,
    },
    brandingLine: {
        width: 36,
        height: 2,
        borderRadius: 1,
        opacity: 0.7,
    },
    brandingText: {
        fontSize: 10,
        color: Colors.textMuted,
        fontWeight: "600",
        letterSpacing: 1,
        textTransform: "lowercase",
    },
    shareActionContainer: {
        width: CARD_WIDTH,
        marginTop: 18,
    },
    shareButton: {
        width: "100%",
        borderRadius: 14,
        overflow: "hidden",
        elevation: 6,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    shareButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 13,
        gap: 8,
    },
    shareButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
});
