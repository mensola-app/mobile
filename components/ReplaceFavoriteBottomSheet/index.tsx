import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import BottomSheet from "@/components/BottomSheet";
import { MovieService } from "@/services/movie.service";
import { TrackService } from "@/services/track.service";
import { Colors } from "@/constants/colors";
import { MovieId, TrackId } from "@/types/common.types";

interface ReplaceFavoriteBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    type: "movie" | "track";
    newItemId: string;
    onSuccess: () => void;
}

interface DisplayItem {
    id: string;
    title: string;
    image: string;
    subtitle?: string;
}

export default function ReplaceFavoriteBottomSheet({
    isVisible,
    onClose,
    type,
    newItemId,
    onSuccess,
}: ReplaceFavoriteBottomSheetProps) {
    const [favorites, setFavorites] = useState<DisplayItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const { t } = useTranslation();

    const fetchFavorites = async () => {
        setIsLoading(true);
        setError("");
        try {
            if (type === "movie") {
                const response = await MovieService.getFavoriteMovies(1, 3);
                const mapped = (response.data?.items || []).map((item) => ({
                    id: item.id,
                    title: item.title,
                    image: item.poster,
                    subtitle: item.releaseDate ? new Date(item.releaseDate).getFullYear().toString() : "",
                }));
                setFavorites(mapped);
            } else {
                const response = await TrackService.getFavoriteTracks(1, 3);
                const mapped = (response.data?.items || []).map((item) => ({
                    id: item.id,
                    title: item.title,
                    image: typeof item.image === "string" ? item.image : "",
                    subtitle: item.artists?.map((a) => a.name).join(", ") || "",
                }));
                setFavorites(mapped);
            }
        } catch (err: any) {
            setError(t("replaceFavorite.loadError"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible) {
            fetchFavorites();
        }
    }, [isVisible]);

    const handleReplace = async (oldItemId: string, oldItemTitle: string) => {
        Alert.alert(
            t("replaceFavorite.confirmTitle"),
            t("replaceFavorite.confirmBody", { title: oldItemTitle }),
            [
                { text: t("replaceFavorite.cancel"), style: "cancel" },
                {
                    text: t("replaceFavorite.confirm"),
                    onPress: async () => {
                        setActionLoadingId(oldItemId);
                        try {
                            if (type === "movie") {
                                await MovieService.addToFavorites({
                                    movieId: newItemId as MovieId,
                                    replaceMovieId: oldItemId as MovieId,
                                });
                            } else {
                                await TrackService.addToFavorites({
                                    trackId: newItemId as TrackId,
                                    replaceTrackId: oldItemId as TrackId,
                                });
                            }
                            onSuccess();
                            onClose();
                        } catch (err: any) {
                            const apiErrorMessage =
                                err?.error?.message || err?.message || t("replaceFavorite.replaceError");
                            Alert.alert(t("common.error"), apiErrorMessage);
                        } finally {
                            setActionLoadingId(null);
                        }
                    },
                },
            ],
        );
    };

    return (
        <BottomSheet
            isVisible={isVisible}
            onClose={onClose}
            title={type === "movie" ? t("replaceFavorite.movieTitle") : t("replaceFavorite.trackTitle")}
            showCloseButton>
            <View style={styles.container}>
                <Text style={styles.infoText}>
                    {t("replaceFavorite.infoText")}
                </Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ paddingVertical: 24 }} />
                ) : (
                    <FlatList
                        data={favorites}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.itemRow}
                                onPress={() => handleReplace(item.id, item.title)}
                                disabled={actionLoadingId !== null}
                                activeOpacity={0.7}>
                                <Image
                                    source={item.image ? { uri: item.image } : require("../../assets/images/icon.png")}
                                    style={styles.itemImage}
                                    contentFit="cover"
                                    cachePolicy="memory-disk"
                                    transition={150}
                                />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemTitle} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    {item.subtitle ? (
                                        <Text style={styles.itemSubtitle} numberOfLines={1}>
                                            {item.subtitle}
                                        </Text>
                                    ) : null}
                                </View>
                                <View style={styles.actionContainer}>
                                    {actionLoadingId === item.id ? (
                                        <ActivityIndicator size="small" color={Colors.primary} />
                                    ) : (
                                        <Ionicons name="swap-horizontal" size={22} color={Colors.primary} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            !isLoading ? <Text style={styles.emptyText}>{t("replaceFavorite.emptyText")}</Text> : null
                        }
                    />
                )}
            </View>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 24,
    },
    infoText: {
        fontSize: 14,
        color: "#A7A7A7",
        marginBottom: 16,
        lineHeight: 20,
    },
    errorText: {
        color: Colors.danger || "#FF3B30",
        fontSize: 14,
        marginBottom: 12,
        textAlign: "center",
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222222",
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        backgroundColor: "#1A1A1A",
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    itemTitle: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "600",
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 12,
        color: "#A7A7A7",
    },
    actionContainer: {
        width: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        color: "#A7A7A7",
        textAlign: "center",
        paddingVertical: 24,
    },
});
