import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./styles";

interface GoogleSignInButtonProps {
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    testID?: string;
}

export default function GoogleSignInButton({
    onPress,
    loading = false,
    disabled = false,
    testID = "google-signin-button",
}: GoogleSignInButtonProps) {
    const { t } = useTranslation();
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[styles.button, isDisabled && styles.disabled]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("auth.google.buttonLabel")}
            accessibilityState={{ busy: loading, disabled: isDisabled }}
            testID={testID}>
            {loading ? (
                <ActivityIndicator size="small" color="#F0F4FF" />
            ) : (
                <View style={styles.content}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="logo-google" size={18} color="#F0F4FF" />
                    </View>
                    <Text style={styles.label}>{t("auth.google.buttonLabel")}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
