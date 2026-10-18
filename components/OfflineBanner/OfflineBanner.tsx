import React, { useEffect, useRef, useState, useContext } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { useNetworkStatus } from "@/utils/network";

export interface OfflineBannerProps {
    /**
     * Optional manual override of online status for testing.
     */
    isOnlineOverride?: boolean;
    hasBeenOfflineOverride?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
    isOnlineOverride,
    hasBeenOfflineOverride,
}) => {
    const { t } = useTranslation();
    const network = useNetworkStatus();
    const insets = useContext(SafeAreaInsetsContext) || { top: 0, bottom: 0, left: 0, right: 0 };

    const isOnline = isOnlineOverride !== undefined ? isOnlineOverride : network.isOnline;
    const hasBeenOffline =
        hasBeenOfflineOverride !== undefined ? hasBeenOfflineOverride : network.hasBeenOffline;

    const [isVisible, setIsVisible] = useState<boolean>(!isOnline);
    const [bannerType, setBannerType] = useState<"offline" | "online">(!isOnline ? "offline" : "online");

    const animY = useRef(new Animated.Value(!isOnline ? 0 : -60)).current;
    const animOpacity = useRef(new Animated.Value(!isOnline ? 1 : 0)).current;

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;

        if (!isOnline) {
            setBannerType("offline");
            setIsVisible(true);
            Animated.parallel([
                Animated.timing(animY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(animOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (hasBeenOffline) {
            // Returned back online
            setBannerType("online");
            setIsVisible(true);
            Animated.parallel([
                Animated.timing(animY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(animOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-hide after 2.5 seconds
            timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(animY, {
                        toValue: -60,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setIsVisible(false);
                });
            }, 2500);
        } else {
            setIsVisible(false);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isOnline, hasBeenOffline, animY, animOpacity]);

    if (!isVisible) {
        return null;
    }

    const isOffline = bannerType === "offline";
    const backgroundColor = isOffline ? "#241014" : "#0F2417";
    const borderColor = isOffline ? "#5C1D24" : "#1D5C35";
    const textColor = isOffline ? "#FFCCC7" : "#D9F7BE";
    const iconName = isOffline ? "cloud-offline" : "checkmark-circle";
    const iconColor = isOffline ? "#FF4D4F" : "#52C41A";
    const message = isOffline
        ? t("common.offlineBanner", { defaultValue: "İnternet bağlantısı yok" })
        : t("common.onlineBanner", { defaultValue: "Yeniden bağlandı" });

    return (
        <View
            pointerEvents="none"
            style={[
                styles.wrapper,
                { top: Math.max(insets.top, 8) },
            ]}
            accessibilityRole="alert"
        >
            <Animated.View
                style={[
                    styles.banner,
                    {
                        backgroundColor,
                        borderColor,
                        transform: [{ translateY: animY }],
                        opacity: animOpacity,
                    },
                ]}
            >
                <Ionicons name={iconName} size={16} color={iconColor} style={styles.icon} />
                <Text style={[styles.text, { color: textColor }]}>{message}</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 99999,
        alignItems: "center",
        justifyContent: "center",
    },
    banner: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 8,
    },
    icon: {
        marginRight: 8,
    },
    text: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.2,
    },
});

export default OfflineBanner;
