import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Linking,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import BottomSheet from "@/components/BottomSheet";
import { ImportService } from "@/services/import.service";
import { Colors } from "@/constants/colors";
import { useImportJob } from "@/hooks/useImportJob";
import { logger } from "@/utils/logger";
import { styles } from "./ImportLetterboxdModal.styles";

interface Props {
    isVisible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type ModalStep = "guide" | "uploading" | "progress" | "completed";

const ACTIVE_JOB_KEY = "active_import_job_id";

export default function ImportLetterboxdModal({ isVisible, onClose, onSuccess }: Props) {
    const { t } = useTranslation();
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const {
        step,
        setStep,
        progressData,
        error,
        setError,
        progressWidth,
        percent,
        startJob,
    } = useImportJob<ModalStep>({
        storageKey: ACTIVE_JOB_KEY,
        keepAwakeTag: "letterboxd-import",
        isVisible,
        defaultStep: "guide",
        genericErrorMessage: t("settings.letterboxdImport.genericError"),
        onSuccessQueryKeys: [
            ["profile"],
            ["movies"],
            ["user"],
            ["watchlist"],
            ["movieLists"],
        ],
        onSuccess,
    });

    const handleOpenLetterboxd = async () => {
        try {
            await Linking.openURL("https://letterboxd.com/settings/data/");
        } catch (err) {
            logger.error("Failed to open Letterboxd data export URL", err);
            setError(t("settings.letterboxdImport.genericError"));
        }
    };

    const handleSelectFile = async () => {
        setError(null);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/zip",
                    "application/x-zip-compressed",
                    "application/octet-stream",
                    "*/*",
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const file = result.assets[0];

            // Verify extension
            if (!file.name.toLowerCase().endsWith(".zip")) {
                setError(t("settings.letterboxdImport.invalidZip"));
                return;
            }

            // Verify size (50MB)
            if (file.size && file.size > 50 * 1024 * 1024) {
                setError(t("settings.letterboxdImport.fileTooLarge"));
                return;
            }

            // Upload
            setIsUploading(true);
            setStep("uploading");

            const job = await ImportService.uploadLetterboxdZip({
                uri: file.uri,
                name: file.name,
                mimeType: file.mimeType || "application/zip",
                size: file.size,
            });

            await startJob(job.jobId, job.totalItems, "letterboxd");
        } catch (err: any) {
            setStep("guide");
            const message =
                err?.error?.message ||
                err?.message ||
                t("settings.letterboxdImport.genericError");
            setError(message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRunInBackground = () => {
        // Keeps job in AsyncStorage so user can reopen modal later
        onClose();
    };

    const handleFinish = () => {
        onClose();
    };

    return (
        <BottomSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t("settings.letterboxdImport.title")}
            showCloseButton
        >
            <View style={styles.container}>
                {error && (
                    <View style={styles.errorBanner}>
                        <Ionicons name="alert-circle" size={20} color={Colors.danger} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Step 1 & 2: Guide and File Selection */}
                {(step === "guide" || step === "uploading") && (
                    <View>
                        <Text style={styles.subtitle}>
                            {t("settings.letterboxdImport.subtitle")}
                        </Text>

                        <View style={styles.guideCard}>
                            <Text style={styles.guideTitle}>
                                {t("settings.letterboxdImport.guideTitle")}
                            </Text>

                            <View style={styles.stepRow}>
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepBadgeText}>1</Text>
                                </View>
                                <Text style={styles.stepText}>
                                    {t("settings.letterboxdImport.step1")}
                                </Text>
                            </View>

                            <View style={styles.stepRow}>
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepBadgeText}>2</Text>
                                </View>
                                <Text style={styles.stepText}>
                                    {t("settings.letterboxdImport.step2")}
                                </Text>
                            </View>

                            <View style={styles.stepRow}>
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepBadgeText}>3</Text>
                                </View>
                                <Text style={styles.stepText}>
                                    {t("settings.letterboxdImport.step3")}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.openLinkButton}
                            onPress={handleOpenLetterboxd}
                            activeOpacity={0.7}
                            disabled={isUploading}
                        >
                            <Ionicons name="open-outline" size={18} color={Colors.textPrimary} />
                            <Text style={styles.openLinkText}>
                                {t("settings.letterboxdImport.openLetterboxd")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handleSelectFile}
                            activeOpacity={0.8}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.uploadButtonText}>
                                    {t("settings.letterboxdImport.selectZipButton")}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 3: Progress Tracking Screen */}
                {step === "progress" && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressIconContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>

                        <Text style={styles.progressTitle}>
                            {t("settings.letterboxdImport.processingTitle")}
                        </Text>

                        <Text style={styles.progressSubtitle}>
                            {t("settings.letterboxdImport.progressText", {
                                percent,
                                current: progressData?.processedItems ?? 0,
                                total: progressData?.totalItems ?? 0,
                            })}
                        </Text>

                        <View style={styles.progressBarTrack}>
                            <Animated.View
                                style={[styles.progressBarFill, { width: progressWidth }]}
                            />
                        </View>

                        <View style={styles.progressStatsRow}>
                            <Text style={styles.progressStatText}>
                                {t("common.success")}:{" "}
                                <Text style={styles.progressStatValue}>
                                    {progressData?.successCount ?? 0}
                                </Text>
                            </Text>
                            {(progressData?.failedCount ?? 0) > 0 && (
                                <Text style={styles.progressStatText}>
                                    Atlanan:{" "}
                                    <Text style={[styles.progressStatValue, { color: Colors.warning }]}>
                                        {progressData?.failedCount}
                                    </Text>
                                </Text>
                            )}
                        </View>

                        <View style={styles.backgroundInfoBox}>
                            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                            <Text style={styles.backgroundInfoText}>
                                {t("settings.letterboxdImport.backgroundInfo")}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.backgroundButton}
                            onPress={handleRunInBackground}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.backgroundButtonText}>
                                {t("settings.letterboxdImport.backgroundButton")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 4: Success & Summary Screen */}
                {step === "completed" && (
                    <View style={styles.successContainer}>
                        <View style={styles.successIconContainer}>
                            <Ionicons name="checkmark-circle" size={44} color={Colors.success} />
                        </View>

                        <Text style={styles.successTitle}>
                            {t("settings.letterboxdImport.successTitle")}
                        </Text>

                        <Text style={styles.successMessage}>
                            {(() => {
                                const watched = progressData?.watchedCount ?? 0;
                                const watchlist = progressData?.watchlistCount ?? 0;
                                const lists = progressData?.listsCount ?? 0;
                                const count = progressData?.successCount ?? progressData?.totalItems ?? 0;

                                if (watched > 0 && watchlist > 0 && lists > 0) {
                                    return t("settings.letterboxdImport.successDetailedWithLists", {
                                        watched,
                                        watchlist,
                                        lists,
                                    });
                                } else if (watched > 0 && lists > 0) {
                                    return t("settings.letterboxdImport.successWatchedAndLists", {
                                        watched,
                                        lists,
                                    });
                                } else if (watchlist > 0 && lists > 0) {
                                    return t("settings.letterboxdImport.successWatchlistAndLists", {
                                        watchlist,
                                        lists,
                                    });
                                } else if (lists > 0 && watched === 0 && watchlist === 0) {
                                    return t("settings.letterboxdImport.successListsOnly", {
                                        lists,
                                    });
                                } else if (watched > 0 && watchlist > 0) {
                                    return t("settings.letterboxdImport.successDetailed", {
                                        watched,
                                        watchlist,
                                    });
                                } else if (watchlist > 0 && watched === 0) {
                                    return t("settings.letterboxdImport.successWatchlistOnly", {
                                        watchlist,
                                    });
                                }
                                return t("settings.letterboxdImport.successMessage", { count });
                            })()}
                        </Text>

                        {(progressData?.listsCount ?? 0) > 0 && (
                            <View style={styles.listsNoticeBox}>
                                <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                                <Text style={styles.listsNoticeText}>
                                    {t("settings.letterboxdImport.listsPublicNotice")}
                                </Text>
                            </View>
                        )}

                        {progressData?.errors && progressData.errors.length > 0 ? (
                            <View style={styles.failedMoviesContainer}>
                                <View style={styles.failedHeader}>
                                    <Ionicons name="alert-circle-outline" size={18} color={Colors.warning} />
                                    <Text style={styles.failedTitle}>
                                        {t("settings.letterboxdImport.failedMoviesTitle", {
                                            count: progressData.errors.length,
                                        })}
                                    </Text>
                                </View>
                                <Text style={styles.failedDesc}>
                                    {t("settings.letterboxdImport.failedMoviesDesc")}
                                </Text>
                                <ScrollView
                                    style={styles.failedList}
                                    nestedScrollEnabled
                                    showsVerticalScrollIndicator={true}
                                >
                                    {progressData.errors.map((item, idx) => (
                                        <View key={idx} style={styles.failedItemRow}>
                                            <View style={styles.failedMovieInfo}>
                                                <Text style={styles.failedMovieName} numberOfLines={1}>
                                                    {item.movie} {item.year ? `(${item.year})` : ""}
                                                </Text>
                                                <Text style={styles.failedMovieReason} numberOfLines={1}>
                                                    {item.error.includes("not found on TMDB")
                                                        ? t("settings.letterboxdImport.notFoundOnTmdb")
                                                        : item.error}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        ) : (progressData?.failedCount ?? 0) > 0 ? (
                            <View style={styles.skippedNoticeBox}>
                                <Ionicons name="alert-circle-outline" size={18} color={Colors.warning} />
                                <Text style={styles.skippedNoticeText}>
                                    {t("settings.letterboxdImport.skippedNotice", {
                                        count: progressData?.failedCount,
                                    })}
                                </Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={handleFinish}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.doneButtonText}>
                                {t("settings.letterboxdImport.doneButton")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </BottomSheet>
    );
}
