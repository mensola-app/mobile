import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    Platform,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import BottomSheet from "@/components/BottomSheet";
import { Colors } from "@/constants/colors";
import { WatchedMovie } from "@/types/movie.types";
import { MovieId, WatchedMovieId } from "@/types/common.types";
import { useWatched } from "@/hooks/movie/useWatched";

interface WatchedMovieBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    movieId?: MovieId;
    movieTitle?: string;
    /** Kullanıcı daha önce izledi olarak işaretlediyse bu array dolu gelir */
    watchedHistory: WatchedMovie[];
    /** Yeni kayıt eklendiğinde çağrılır */
    onAdded: (record: WatchedMovie) => void;
    /** Bir kayıt silindiğinde çağrılır */
    onDeleted: (watchedMovieId: WatchedMovieId) => void;
    /** Bir kayıt güncellendiğinde çağrılır */
    onUpdated: (updated: WatchedMovie) => void;
}

const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
};

export default function WatchedMovieBottomSheet({
    isVisible,
    onClose,
    movieId,
    movieTitle,
    watchedHistory,
    onAdded,
    onDeleted,
    onUpdated,
}: WatchedMovieBottomSheetProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState<boolean>(Platform.OS === "ios");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { markAsWatched, updateWatchedAt, deleteWatchedEntry, isLoading } = useWatched(movieId);

    // Her açılışta tarihi bugüne sıfırla
    useEffect(() => {
        if (isVisible) {
            setSelectedDate(new Date());
            if (Platform.OS !== "ios") {
                setShowDatePicker(false);
            }
        }
    }, [isVisible]);

    const handleDateChange = (_: DateTimePickerEvent, date?: Date) => {
        if (Platform.OS === "android") {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleAddNew = async () => {
        if (!movieId) return;
        setIsSubmitting(true);
        try {
            const isoDate = selectedDate.toISOString();
            const response = await markAsWatched(movieId, undefined, isoDate);
            if (response?.data) {
                onAdded(response.data as WatchedMovie);
            }
        } catch (e) {
            // hook içinde yönetiliyor
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (record: WatchedMovie) => {
        Alert.alert(
            "Kaydı Sil",
            `${formatDate(record.watchedAt)} tarihli izleme kaydını silmek istediğine emin misin?`,
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteWatchedEntry(record.id as WatchedMovieId, () => {
                                onDeleted(record.id as WatchedMovieId);
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
            title={movieTitle ? `${movieTitle}` : "İzleme Geçmişi"}
            showCloseButton
        >
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Geçmiş Kayıtlar */}
                {hasHistory && (
                    <View style={styles.historySection}>
                        <Text style={styles.sectionTitle}>Geçmiş Kayıtlar</Text>
                        {watchedHistory.map((record) => (
                            <View key={record.id} style={styles.historyRow}>
                                <View style={styles.historyLeft}>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                                    <Text style={styles.historyDate}>{formatDate(record.watchedAt)}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDelete(record)}
                                    style={styles.deleteBtn}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <View style={styles.divider} />
                    </View>
                )}

                {/* Yeni Kayıt Ekle */}
                <View style={styles.addSection}>
                    <Text style={styles.sectionTitle}>Yeni Kayıt Ekle</Text>
                    <Text style={styles.dateLabel}>İzleme Tarihi</Text>

                    {Platform.OS === "android" && !showDatePicker && (
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={styles.dateButton}
                        >
                            <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                            <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
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
                            locale="tr-TR"
                        />
                    )}

                    <TouchableOpacity
                        onPress={handleAddNew}
                        style={[styles.addButton, (isSubmitting || isLoading) && styles.addButtonDisabled]}
                        disabled={isSubmitting || isLoading}
                        activeOpacity={0.8}
                    >
                        {isSubmitting || isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                                <Text style={styles.addButtonText}>Kaydet</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    historySection: {
        marginBottom: 8,
    },
    addSection: {
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    historyLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    historyDate: {
        color: Colors.textPrimary,
        fontSize: 15,
    },
    deleteBtn: {
        padding: 4,
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
        backgroundColor: Colors.success,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
