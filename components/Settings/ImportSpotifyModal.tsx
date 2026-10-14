import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import BottomSheet from "@/components/BottomSheet";
import { ImportService } from "@/services/import.service";
import { ImportFailedItem } from "@/types/import.types";
import { Colors } from "@/constants/colors";
import { useImportJob } from "@/hooks/useImportJob";
import { styles } from "./ImportSpotifyModal.styles";

interface Props {
    isVisible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type ModalStep = "input" | "uploading" | "progress" | "completed";

const ACTIVE_JOB_KEY = "active_spotify_import_job_id";
const MAX_PLAYLISTS = 10;

// Client-side quick check for non-playlist Spotify URLs
const NON_PLAYLIST_PATTERN = /(?:open\.spotify\.com\/(?:intl-[a-z]{2}\/)?|spotify:)(track|album|artist|show|episode)[/:]([a-zA-Z0-9]+)/i;

export default function ImportSpotifyModal({ isVisible, onClose, onSuccess }: Props) {
    const { t } = useTranslation();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [urlInput, setUrlInput] = useState<string>("");
    const [playlistUrls, setPlaylistUrls] = useState<string[]>([]);

    const {
        step,
        setStep,
        progressData,
        error,
        setError,
        progressWidth,
        percent,
        startJob,
        stopPolling,
        cancelOrResetJob,
    } = useImportJob<ModalStep>({
        storageKey: ACTIVE_JOB_KEY,
        keepAwakeTag: "spotify-import",
        isVisible,
        defaultStep: "input",
        genericErrorMessage: t("settings.spotifyImport.genericError"),
        onSuccessQueryKeys: [
            ["profile"],
            ["playlists"],
            ["userPlaylists"],
            ["tracks"],
        ],
        onSuccess,
    });

    const handleAddUrl = () => {
        setError(null);
        const trimmed = urlInput.trim();
        if (!trimmed) return;

        if (NON_PLAYLIST_PATTERN.test(trimmed)) {
            setError(t("settings.spotifyImport.inputNotPlaylist"));
            return;
        }

        if (playlistUrls.length >= MAX_PLAYLISTS) {
            setError(t("settings.spotifyImport.maxLimitReached"));
            return;
        }

        if (playlistUrls.includes(trimmed)) {
            setError(t("settings.spotifyImport.alreadyAdded"));
            return;
        }

        setPlaylistUrls((prev) => [...prev, trimmed]);
        setUrlInput("");
    };

    const handleRemoveUrl = (index: number) => {
        setPlaylistUrls((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleStartImport = async () => {
        setError(null);

        // Include current text in input if user typed but forgot to press Add
        const currentUrls = [...playlistUrls];
        const trimmed = urlInput.trim();
        if (trimmed && !currentUrls.includes(trimmed)) {
            if (NON_PLAYLIST_PATTERN.test(trimmed)) {
                setError(t("settings.spotifyImport.inputNotPlaylist"));
                return;
            }
            currentUrls.push(trimmed);
        }

        if (currentUrls.length === 0) {
            setError(t("settings.spotifyImport.emptyListError"));
            return;
        }

        if (currentUrls.length > MAX_PLAYLISTS) {
            setError(t("settings.spotifyImport.maxLimitReached"));
            return;
        }

        try {
            setIsSubmitting(true);
            setStep("uploading");

            const job = await ImportService.importSpotifyPlaylists(currentUrls);

            await startJob(job.jobId, currentUrls.length, "spotify");
            setPlaylistUrls([]);
            setUrlInput("");
        } catch (err: any) {
            setStep("input");
            const errorMsg =
                err?.response?.data?.message ||
                err?.message ||
                t("settings.spotifyImport.genericError");
            setError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackgroundClose = () => {
        stopPolling();
        onClose();
    };

    const handleCompletedClose = async () => {
        await cancelOrResetJob();
        onClose();
    };

    const renderInputContent = () => (
        <View style={styles.container}>
            <Text style={styles.subtitle}>{t("settings.spotifyImport.subtitle")}</Text>

            {error && (
                <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>{t("settings.spotifyImport.inputLabel")}</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.textInput}
                        placeholder={t("settings.spotifyImport.inputPlaceholder")}
                        placeholderTextColor={Colors.textSecondary}
                        value={urlInput}
                        onChangeText={(text) => {
                            setUrlInput(text);
                            if (error) setError(null);
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={handleAddUrl}
                    />
                    <TouchableOpacity
                        style={[styles.addButton, !urlInput.trim() && styles.addButtonDisabled]}
                        onPress={handleAddUrl}
                        disabled={!urlInput.trim()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.addButtonText}>{t("settings.spotifyImport.addButton")}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.inputHintText}>{t("settings.spotifyImport.inputHint")}</Text>
            </View>

            {playlistUrls.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>
                        {t("settings.spotifyImport.playlistsCount", { count: playlistUrls.length })}
                    </Text>
                    <ScrollView style={styles.playlistsList} nestedScrollEnabled>
                        {playlistUrls.map((url, idx) => (
                            <View key={`${url}-${idx}`} style={styles.playlistItem}>
                                <Ionicons name="musical-notes" size={16} color="#1DB954" />
                                <Text style={styles.playlistItemText} numberOfLines={1}>
                                    {url}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleRemoveUrl(idx)}
                                    style={styles.removeButton}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </>
            )}

            <View style={styles.publicNoticeBox}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                <Text style={styles.publicNoticeText}>{t("settings.spotifyImport.publicNotice")}</Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.importButton,
                    (playlistUrls.length === 0 && !urlInput.trim()) || isSubmitting
                        ? styles.importButtonDisabled
                        : null,
                ]}
                onPress={handleStartImport}
                disabled={(playlistUrls.length === 0 && !urlInput.trim()) || isSubmitting}
                activeOpacity={0.8}
            >
                {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.importButtonText}>{t("settings.spotifyImport.importButton")}</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    const renderProgressContent = () => {
        const total = progressData?.totalItems || 1;
        const current = progressData?.processedItems || 0;
        const percent = Math.min(100, Math.round((current / total) * 100));
        const tracksCount = progressData?.tracksCount || 0;

        return (
            <View style={[styles.container, styles.progressContainer]}>
                <View style={styles.progressIconContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                </View>

                <Text style={styles.progressTitle}>{t("settings.spotifyImport.processingTitle")}</Text>
                <Text style={styles.progressSubtitle}>
                    {t("settings.spotifyImport.progressText", { percent, current, total })}
                </Text>

                <View style={styles.progressBarTrack}>
                    <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
                </View>

                <View style={styles.progressStatsRow}>
                    <Text style={styles.progressStatText}>
                        {t("settings.spotifyImport.tracksImported", { count: tracksCount })}
                    </Text>
                    <Text style={styles.progressStatValue}>{percent}%</Text>
                </View>

                <View style={styles.backgroundInfoBox}>
                    <Ionicons name="notifications-outline" size={16} color={Colors.primary} />
                    <Text style={styles.backgroundInfoText}>{t("settings.spotifyImport.backgroundInfo")}</Text>
                </View>

                <TouchableOpacity
                    style={styles.backgroundButton}
                    onPress={handleBackgroundClose}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backgroundButtonText}>
                        {t("settings.spotifyImport.backgroundButton")}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFailedReason = (item: ImportFailedItem) => {
        const err = item.error || "";
        const code = item.errorCode || "";
        if (
            code === "PLAYLIST_NOT_FOUND" ||
            err === "PLAYLIST_NOT_FOUND" ||
            err === "Spotify çalma listesi bulunamadı veya gizli." ||
            err === "Spotify playlist not found or is private." ||
            err.toLowerCase().includes("bulunamadı") ||
            err.toLowerCase().includes("not found") ||
            err.toLowerCase().includes("gizli") ||
            err.toLowerCase().includes("private")
        ) {
            return t("settings.spotifyImport.playlistNotFound");
        }
        return err || t("settings.spotifyImport.genericError");
    };

    const renderCompletedContent = () => {
        const playlists = progressData?.playlistsCount ?? progressData?.successCount ?? 0;
        const tracks = progressData?.tracksCount ?? 0;
        const failedItems = progressData?.errors || [];

        return (
            <View style={[styles.container, styles.successContainer]}>
                <View style={styles.successIconContainer}>
                    <Ionicons name="checkmark-circle" size={48} color="#1DB954" />
                </View>

                <Text style={styles.successTitle}>{t("settings.spotifyImport.successTitle")}</Text>
                <Text style={styles.successMessage}>
                    {t("settings.spotifyImport.successMessage", { playlists, tracks })}
                </Text>

                {failedItems.length > 0 && (
                    <View style={styles.failedContainer}>
                        <View style={styles.failedHeader}>
                            <Ionicons name="warning-outline" size={16} color={Colors.warning} />
                            <Text style={styles.failedTitle}>
                                {t("settings.spotifyImport.failedPlaylistsTitle", { count: failedItems.length })}
                            </Text>
                        </View>
                        <Text style={styles.failedDesc}>
                            {t("settings.spotifyImport.failedPlaylistsDesc")}
                        </Text>
                        <ScrollView style={styles.failedList} nestedScrollEnabled>
                            {failedItems.map((item, idx) => (
                                <View key={`failed-${idx}`} style={styles.failedItemRow}>
                                    <View style={styles.failedItemInfo}>
                                        <Text style={styles.failedItemName} numberOfLines={1}>
                                            {item.playlist || "Spotify Playlist"}
                                        </Text>
                                        <Text style={styles.failedReason}>{renderFailedReason(item)}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={handleCompletedClose}
                    activeOpacity={0.8}
                >
                    <Text style={styles.doneButtonText}>{t("settings.spotifyImport.doneButton")}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <BottomSheet
            isVisible={isVisible}
            onClose={step === "progress" ? handleBackgroundClose : onClose}
            title={
                step === "completed"
                    ? t("settings.spotifyImport.successTitle")
                    : step === "progress"
                    ? t("settings.spotifyImport.processingTitle")
                    : t("settings.spotifyImport.title")
            }
            showCloseButton={step !== "progress"}
        >
            {step === "input" && renderInputContent()}
            {step === "uploading" && (
                <View style={[styles.container, styles.progressContainer]}>
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text style={[styles.progressSubtitle, { marginTop: 16 }]}>
                        {t("settings.spotifyImport.processingTitle")}...
                    </Text>
                </View>
            )}
            {step === "progress" && renderProgressContent()}
            {step === "completed" && renderCompletedContent()}
        </BottomSheet>
    );
}
