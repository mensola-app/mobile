import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import BottomSheet from "@/components/BottomSheet";
import { ImportService } from "@/services/import.service";
import { ImportJobProgress } from "@/types/import.types";
import { Colors } from "@/constants/colors";
import { styles } from "./ImportLetterboxdModal.styles";

interface Props {
    isVisible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type ModalStep = "guide" | "uploading" | "progress" | "completed";

const ACTIVE_JOB_KEY = "active_import_job_id";
const POLLING_INTERVAL_MS = 2500;
const MAX_CONSECUTIVE_ERRORS = 3;

export default function ImportLetterboxdModal({ isVisible, onClose, onSuccess }: Props) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [step, setStep] = useState<ModalStep>("guide");
    const [jobId, setJobId] = useState<string | null>(null);
    const [progressData, setProgressData] = useState<ImportJobProgress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [animatedProgress] = useState(() => new Animated.Value(0));
    const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const consecutiveErrorsRef = useRef<number>(0);

    const progressWidth = useMemo(
        () =>
            animatedProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
            }),
        [animatedProgress],
    );

    const stopPolling = useCallback(() => {
        if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
        }
    }, []);

    const startPolling = useCallback(
        (targetJobId: string) => {
            stopPolling();
            consecutiveErrorsRef.current = 0;

            const poll = async () => {
                try {
                    const data = await ImportService.getImportProgress(targetJobId);
                    consecutiveErrorsRef.current = 0;
                    setProgressData(data);

                    if (data.status === "completed") {
                        stopPolling();
                        await AsyncStorage.removeItem(ACTIVE_JOB_KEY);
                        setStep("completed");

                        // Invalidate caches
                        queryClient.invalidateQueries({ queryKey: ["profile"] });
                        queryClient.invalidateQueries({ queryKey: ["movies"] });
                        queryClient.invalidateQueries({ queryKey: ["user"] });
                        onSuccess?.();
                    } else if (data.status === "failed") {
                        stopPolling();
                        await AsyncStorage.removeItem(ACTIVE_JOB_KEY);
                        setStep("guide");
                        setError(t("settings.letterboxdImport.genericError"));
                    }
                } catch {
                    consecutiveErrorsRef.current += 1;
                    // Only surface error if 3 consecutive failures occur
                    if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
                        setError(t("settings.letterboxdImport.genericError"));
                    }
                }
            };

            // Run immediately then interval
            poll();
            pollingTimerRef.current = setInterval(poll, POLLING_INTERVAL_MS);
        },
        [onSuccess, queryClient, stopPolling, t],
    );

    // Check for existing active job when modal opens
    useEffect(() => {
        let isMounted = true;
        if (isVisible) {
            AsyncStorage.getItem(ACTIVE_JOB_KEY)
                .then(async (savedJobId) => {
                    if (!isMounted) return;
                    if (savedJobId) {
                        setJobId(savedJobId);
                        try {
                            const status = await ImportService.getImportProgress(savedJobId);
                            if (!isMounted) return;
                            setProgressData(status);
                            if (status.status === "completed") {
                                await AsyncStorage.removeItem(ACTIVE_JOB_KEY);
                                setStep("completed");
                            } else if (status.status === "failed") {
                                await AsyncStorage.removeItem(ACTIVE_JOB_KEY);
                                setStep("guide");
                                setError(t("settings.letterboxdImport.genericError"));
                            } else {
                                setStep("progress");
                            }
                        } catch {
                            if (isMounted) setStep("progress");
                        }
                    } else {
                        setStep((prev) =>
                            prev === "uploading" || prev === "progress" || prev === "completed"
                                ? prev
                                : "guide",
                        );
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setStep((prev) =>
                            prev === "uploading" || prev === "progress" || prev === "completed"
                                ? prev
                                : "guide",
                        );
                    }
                });
        } else {
            stopPolling();
        }
        return () => {
            isMounted = false;
        };
    }, [isVisible, stopPolling, t]);

    // Keep screen awake while watching progress
    useEffect(() => {
        if (step === "progress" && isVisible) {
            activateKeepAwakeAsync("letterboxd-import").catch(() => {});
        } else {
            deactivateKeepAwake("letterboxd-import").catch(() => {});
        }
        return () => {
            deactivateKeepAwake("letterboxd-import").catch(() => {});
        };
    }, [step, isVisible]);

    // Animate progress bar fill
    useEffect(() => {
        if (progressData && progressData.totalItems > 0) {
            const ratio = Math.min(1, progressData.processedItems / progressData.totalItems);
            Animated.timing(animatedProgress, {
                toValue: ratio,
                duration: 400,
                useNativeDriver: false,
            }).start();
        }
    }, [animatedProgress, progressData]);

    // Polling effect when on progress step
    useEffect(() => {
        if (step === "progress" && jobId && isVisible) {
            startPolling(jobId);
        } else {
            stopPolling();
        }
        return () => stopPolling();
    }, [step, jobId, isVisible, startPolling, stopPolling]);

    const handleOpenLetterboxd = async () => {
        try {
            await Linking.openURL("https://letterboxd.com/settings/data/");
        } catch {
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

            await AsyncStorage.setItem(ACTIVE_JOB_KEY, job.jobId);
            setJobId(job.jobId);
            setProgressData({
                jobId: job.jobId,
                userId: "",
                status: "queued",
                totalItems: job.totalItems,
                processedItems: 0,
                successCount: 0,
                failedCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            setStep("progress");
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

    const percent =
        progressData && progressData.totalItems > 0
            ? Math.round((progressData.processedItems / progressData.totalItems) * 100)
            : 0;

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
                            {t("settings.letterboxdImport.successMessage", {
                                count: progressData?.successCount ?? progressData?.totalItems ?? 0,
                            })}
                        </Text>

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
