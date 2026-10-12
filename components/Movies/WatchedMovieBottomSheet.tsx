import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, Platform, ActivityIndicator } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import { Colors } from "@/constants/colors";
import { WatchedMovie } from "@/types/movie.types";
import { MovieId, WatchedMovieId } from "@/types/common.types";
import { useWatched } from "@/hooks/movie/useWatched";

interface WatchedMovieBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    movieId?: MovieId;
    movieTitle?: string;
    initialEditingRecordId?: WatchedMovieId | null;
    onAdded: (record: WatchedMovie) => void;
    onUpdated?: (record: WatchedMovie) => void;
    onDeleted: (watchedMovieId: WatchedMovieId, remainingCount: number) => void;
}

const formatDate = (date: Date | string, locale: string = "tr-TR") => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
};

export default function WatchedMovieBottomSheet({
    isVisible,
    onClose,
    movieId,
    movieTitle,
    initialEditingRecordId,
    onAdded,
    onUpdated,
    onDeleted,
}: WatchedMovieBottomSheetProps) {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language === "tr" ? "tr-TR" : "en-US";

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState<boolean>(Platform.OS === "ios");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingRecord, setEditingRecord] = useState<WatchedMovie | null>(null);

    const [watchedHistory, setWatchedHistory] = useState<WatchedMovie[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    const { markAsWatched, updateWatchedAt, deleteWatchedEntry, getWatchedHistoryByMovieId } = useWatched(movieId);

    useEffect(() => {
        if (isVisible && movieId) {
            setEditingRecord(null);
            setSelectedDate(new Date());
            if (Platform.OS !== "ios") {
                setShowDatePicker(false);
            }
            fetchHistory();
        }
    }, [isVisible, movieId]);

    const fetchHistory = async () => {
        if (!movieId) return;
        setIsHistoryLoading(true);
        setHistoryError("");
        try {
            const data = await getWatchedHistoryByMovieId(movieId);
            setWatchedHistory(data);

            if (initialEditingRecordId) {
                const target = data.find((h: WatchedMovie) => h.id === initialEditingRecordId) || data[0];
                if (target) {
                    setEditingRecord(target);
                    setSelectedDate(new Date(target.watchedAt));
                    if (Platform.OS === "android") {
                        setShowDatePicker(true);
                    }
                }
            }
        } catch (error) {
            setHistoryError(t("movies.detail.watchedHistory.errorLoad"));
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const handleDateChange = (_: DateTimePickerEvent, date?: Date) => {
        if (Platform.OS === "android") {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
        }
    };

    const startEditing = (record: WatchedMovie) => {
        setEditingRecord(record);
        setSelectedDate(new Date(record.watchedAt));
        if (Platform.OS === "android") {
            setShowDatePicker(true);
        }
    };

    const cancelEditing = () => {
        setEditingRecord(null);
        setSelectedDate(new Date());
        if (Platform.OS === "android") {
            setShowDatePicker(false);
        }
    };

    const handleAddNew = async () => {
        if (!movieId) return;
        setIsSubmitting(true);
        try {
            const isoDate = selectedDate.toISOString();
            const response = await markAsWatched(movieId, undefined, isoDate);
            if (response?.data) {
                const newRecord = response.data as WatchedMovie;
                setWatchedHistory((prev) => [newRecord, ...prev]);
                onAdded(newRecord);
                setSelectedDate(new Date());
            }
        } catch (e) {
            // hook içinde yönetiliyor
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingRecord) return;
        setIsSubmitting(true);
        try {
            const isoDate = selectedDate.toISOString();
            const response = await updateWatchedAt(editingRecord.id as WatchedMovieId, isoDate);
            const updatedRecord: WatchedMovie = response?.data
                ? (response.data as WatchedMovie)
                : { ...editingRecord, watchedAt: isoDate };

            setWatchedHistory((prev) =>
                prev.map((item) => (item.id === editingRecord.id ? { ...item, watchedAt: isoDate } : item))
            );
            onUpdated?.(updatedRecord);
            cancelEditing();
        } catch (e) {
            // hook içinde yönetiliyor
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (record: WatchedMovie) => {
        Alert.alert(
            t("movies.detail.watchedHistory.deleteTitle"),
            t("movies.detail.watchedHistory.deleteBody").replace(
                "{{date}}",
                formatDate(record.watchedAt, currentLocale),
            ),
            [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("common.delete"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteWatchedEntry(record.id as WatchedMovieId, () => {
                                if (editingRecord?.id === record.id) {
                                    cancelEditing();
                                }
                                setWatchedHistory((prev) => prev.filter((h) => h.id !== record.id));
                                onDeleted(record.id as WatchedMovieId, watchedHistory.length - 1);
                            });
                        } catch (e) {
                            // hook içinde yönetiliyor
                        }
                    },
                },
            ],
        );
    };

    const hasHistory = watchedHistory.length > 0;

    return (
        <BottomSheet
            isVisible={isVisible}
            onClose={onClose}
            title={movieTitle ? `${movieTitle}` : t("movies.detail.watchedHistory.sheetTitle")}
            showCloseButton
            scrollable={false}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Geçmiş Kayıtlar */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>{t("movies.detail.watchedHistory.historySection")}</Text>

                    {isHistoryLoading ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
                    ) : historyError ? (
                        <Text style={styles.errorText}>{historyError}</Text>
                    ) : hasHistory ? (
                        <>
                            {watchedHistory.map((record) => {
                                const isBeingEdited = editingRecord?.id === record.id;
                                return (
                                    <View
                                        key={record.id}
                                        style={[
                                            styles.historyRow,
                                            isBeingEdited && styles.historyRowActive,
                                        ]}>
                                        <View style={styles.historyLeft}>
                                            <Ionicons
                                                name={isBeingEdited ? "pencil" : "checkmark-circle"}
                                                size={20}
                                                color={isBeingEdited ? Colors.primary : Colors.success}
                                            />
                                            <View>
                                                <Text
                                                    style={[
                                                        styles.historyDate,
                                                        isBeingEdited && styles.historyDateActive,
                                                    ]}>
                                                    {formatDate(record.watchedAt, currentLocale)}
                                                </Text>
                                                {isBeingEdited ? (
                                                    <Text style={styles.editingBadge}>
                                                        {t("movies.detail.watchedHistory.editSection")}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>
                                        <View style={styles.historyActions}>
                                            <TouchableOpacity
                                                onPress={() => (isBeingEdited ? cancelEditing() : startEditing(record))}
                                                style={styles.actionBtn}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                                <Ionicons
                                                    name={isBeingEdited ? "close" : "pencil-outline"}
                                                    size={18}
                                                    color={isBeingEdited ? Colors.textPrimary : Colors.textSecondary}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDelete(record)}
                                                style={styles.deleteBtn}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                            <View style={styles.divider} />
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t("movies.detail.watchedHistory.empty")}</Text>
                            <View style={styles.divider} />
                        </View>
                    )}
                </View>

                {/* Form Alanı (Yeni Ekle veya Düzenle) */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>
                        {editingRecord
                            ? t("movies.detail.watchedHistory.editSection")
                            : t("movies.detail.watchedHistory.addSection")}
                    </Text>
                    <Text style={styles.dateLabel}>{t("movies.detail.watchedHistory.watchedDate")}</Text>

                    {Platform.OS === "android" && !showDatePicker && (
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                            <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                            <Text style={styles.dateButtonText}>{formatDate(selectedDate, currentLocale)}</Text>
                        </TouchableOpacity>
                    )}

                    {(showDatePicker || Platform.OS === "ios") && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                            style={styles.datePicker}
                            textColor={Colors.textPrimary}
                            themeVariant="dark"
                            locale={currentLocale}
                        />
                    )}

                    {editingRecord ? (
                        <View style={styles.buttonRow}>
                            <Button
                                label={t("movies.detail.watchedHistory.cancelEdit")}
                                onPress={cancelEditing}
                                style={styles.cancelButton}
                                labelStyle={styles.cancelButtonText}
                            />
                            <Button
                                label={t("movies.detail.watchedHistory.update")}
                                onPress={handleUpdate}
                                isLoading={isSubmitting}
                                style={styles.submitButton}
                            />
                        </View>
                    ) : (
                        <Button
                            label={t("movies.detail.watchedHistory.save")}
                            onPress={handleAddNew}
                            isLoading={isSubmitting}
                            style={styles.addButton}
                        />
                    )}
                </View>
            </ScrollView>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    historySection: {
        marginBottom: 8,
    },
    formSection: {
        paddingBottom: 24,
    },
    sectionTitle: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 12,
    },
    historyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    historyRowActive: {
        backgroundColor: "rgba(56, 189, 248, 0.1)",
        borderColor: Colors.primary,
        borderBottomColor: Colors.primary,
    },
    historyLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    historyDate: {
        color: Colors.textPrimary,
        fontSize: 15,
    },
    historyDateActive: {
        color: Colors.primary,
        fontWeight: "600",
    },
    editingBadge: {
        color: Colors.primary,
        fontSize: 11,
        fontWeight: "500",
        marginTop: 2,
    },
    historyActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    actionBtn: {
        padding: 6,
        borderRadius: 8,
    },
    deleteBtn: {
        padding: 6,
        borderRadius: 8,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 20,
    },
    dateLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dateButtonText: {
        color: Colors.textPrimary,
        fontSize: 15,
    },
    datePicker: {
        marginBottom: 16,
        alignSelf: "stretch",
    },
    addButton: {
        marginTop: 8,
        borderRadius: 14,
    },
    buttonRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        borderRadius: 14,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cancelButtonText: {
        color: Colors.textSecondary,
    },
    submitButton: {
        flex: 1,
        borderRadius: 14,
    },
    loader: {
        marginVertical: 16,
    },
    errorText: {
        color: Colors.danger,
        fontSize: 14,
        marginBottom: 8,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: 14,
        textAlign: "center",
        fontStyle: "italic",
    },
});
