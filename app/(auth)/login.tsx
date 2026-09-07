import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import TextField from "../../components/TextField";
import Button from "../../components/Button";

import { useLogin } from "../../hooks/auth/useLogin";
import { Colors } from "@/constants/colors";

export default function LoginScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const { email, setEmail, password, setPassword, isLoading, error, handleLogin } = useLogin();

    useEffect(() => {
        if (isLoading) return;
        if (error) return Alert.alert(t("common.error"), error);
    }, [isLoading, error]);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.logoText}>mensola</Text>
                </View>

                <View style={styles.formContainer} pointerEvents={isLoading ? "none" : "auto"}>
                    <TextField
                        label={t("auth.login.emailLabel")}
                        type="email"
                        placeholder={t("auth.login.emailPlaceholder")}
                        value={email}
                        onChangeText={setEmail}
                        editable={!isLoading}
                    />
                    <TextField
                        label={t("auth.login.passwordLabel")}
                        type="password"
                        placeholder={t("auth.login.passwordPlaceholder")}
                        value={password}
                        onChangeText={setPassword}
                        editable={!isLoading}
                    />
                    <Button
                        label={t("auth.login.submitButton")}
                        onPress={handleLogin}
                        loading={isLoading}
                        testID="login-submit-button"
                    />
                    <TouchableOpacity
                        style={styles.forgotPasswordContainer}
                        onPress={() => router.push("/forgot-password")}
                        disabled={isLoading}>
                        <Text style={[styles.forgotPasswordText, isLoading && { opacity: 0.5 }]}>
                            {t("auth.login.forgotPasswordText")}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>{t("auth.login.footerText")} </Text>
                    <TouchableOpacity onPress={() => router.push("/signup")} disabled={isLoading}>
                        <Text style={[styles.registerLink, isLoading && { opacity: 0.5 }]}>{t("auth.login.registerLink")}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    innerContainer: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    headerContainer: { alignItems: "center", marginBottom: 48 },
    logoText: {
        fontSize: 42,
        fontWeight: "bold",
        color: Colors.textPrimary,
        letterSpacing: 1.5,
    },
    formContainer: { marginBottom: 24 },
    forgotPasswordContainer: {
        marginTop: 4,
    },
    forgotPasswordText: {
        color: Colors.textSecondary,
    },
    footerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    footerText: { color: Colors.textSecondary, fontSize: 14 },
    registerLink: { color: Colors.primary, fontSize: 14, fontWeight: "bold" },
});
