import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "@/constants/colors";
import { captureException } from "@/utils/monitoring";

interface ErrorFallbackProps {
    error: Error;
    retry: () => Promise<void> | void;
}

/**
 * Root error boundary UI (used as expo-router's `ErrorBoundary` export).
 * Rendered instead of the whole app, so it must not depend on any provider (Auth, Query, ...).
 */
export default function ErrorFallback({ error, retry }: ErrorFallbackProps) {
    const { t } = useTranslation();

    useEffect(() => {
        captureException(error, { source: "RootErrorBoundary" });
    }, [error]);

    return (
        <View style={styles.container} accessibilityRole="alert">
            <Text style={styles.title}>{t("common.errorBoundaryTitle", { defaultValue: "Bir şeyler ters gitti" })}</Text>
            <Text style={styles.message}>
                {t("common.errorBoundaryMessage", {
                    defaultValue: "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.",
                })}
            </Text>
            {__DEV__ ? <Text style={styles.debug}>{error?.message}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={() => retry()} activeOpacity={0.8}>
                <Text style={styles.buttonText}>{t("common.retry", { defaultValue: "Tekrar Dene" })}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: Colors.background,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    message: {
        color: Colors.textMuted,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
    },
    debug: {
        color: Colors.textMuted,
        fontSize: 12,
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    buttonText: {
        color: Colors.textPrimary,
        fontWeight: "600",
    },
});
