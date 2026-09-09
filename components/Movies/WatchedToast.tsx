import React, { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

interface WatchedToastProps {
    visible: boolean;
    onEdit: () => void;
    onHide: () => void;
    /** Otomatik kapanma süresi (ms). Default: 4000 */
    duration?: number;
}

/**
 * Film izlendi olarak işaretlendiğinde ekranın altında çıkan toast bildirimi.
 * "İzlendi olarak eklendi" mesajı ve "Düzenle" butonu içerir.
 * Modal kullanarak tüm ekran üzerinde render edilir.
 */
export default function WatchedToast({ visible, onEdit, onHide, duration = 4000 }: WatchedToastProps) {
    const translateY = useRef(new Animated.Value(120)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (visible) {
            // Slide in
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 4,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();

            // Otomatik kapat
            timerRef.current = setTimeout(() => {
                animateOut();
            }, duration);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [visible]);

    const animateOut = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 120,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
            // reset for next show
            translateY.setValue(120);
            opacity.setValue(0);
        });
    };

    const handleEdit = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        onEdit();
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            statusBarTranslucent
            onRequestClose={animateOut}
        >
            {/* Backdrop - dokunulduğunda kapanır */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={animateOut}
            />
            <Animated.View
                style={[
                    styles.container,
                    { transform: [{ translateY }], opacity },
                ]}
                pointerEvents="box-none"
            >
                <View style={styles.toast}>
                    <View style={styles.leftContent}>
                        <View style={styles.iconWrapper}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                        </View>
                        <Text style={styles.message}>İzlendi olarak eklendi</Text>
                    </View>
                    <TouchableOpacity onPress={handleEdit} activeOpacity={0.7} style={styles.editButton}>
                        <Text style={styles.editText}>Düzenle</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    container: {
        position: "absolute",
        bottom: 32,
        left: 16,
        right: 16,
    },
    toast: {
        backgroundColor: "#1A2332",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: Colors.success + "40",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    leftContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.success + "20",
        alignItems: "center",
        justifyContent: "center",
    },
    message: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: Colors.surface,
    },
    editText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: "600",
    },
});
