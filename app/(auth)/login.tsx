import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import TextField from "../../components/TextField";
import Button from "../../components/Button";
import GoogleSignInButton from "../../components/GoogleSignInButton";

import { useLogin } from "../../hooks/auth/useLogin";
import { useGoogleLogin } from "../../hooks/auth/useGoogleLogin";
import { Colors } from "@/constants/colors";

export default function LoginScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const { email, setEmail, password, setPassword, isLoading, error, handleLogin } = useLogin();
    const { isLoading: isGoogleLoading, handleGoogleLogin } = useGoogleLogin();

    const isBusy = isLoading || isGoogleLoading;

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

                <View style={styles.formContainer}>
                    <TextField
                        label={t("auth.login.emailLabel")}
                        type="email"
                        placeholder={t("auth.login.emailPlaceholder")}
                        value={email}
                        onChangeText={setEmail}
                        editable={!isBusy}
                    />
                    <TextField
                        label={t("auth.login.passwordLabel")}
                        type="password"
                        placeholder={t("auth.login.passwordPlaceholder")}
                        value={password}
                        onChangeText={setPassword}
                        editable={!isBusy}
                    />
                    <Button
                        label={t("auth.login.submitButton")}
                        onPress={handleLogin}
                        loading={isLoading}
                        disabled={isGoogleLoading}
                        testID="login-submit-button"
                    />
                    <TouchableOpacity
                        style={styles.forgotPasswordContainer}
                        onPress={() => router.push("/forgot-password")}
                        disabled={isBusy}>
                        <Text style={[styles.forgotPasswordText, isBusy && { opacity: 0.5 }]}>
                            {t("auth.login.forgotPasswordText")}
                        </Text>
                    </TouchableOpacity>

                    {/* Ayraç */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>{t("auth.google.or")}</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Google Sign-In */}
                    <GoogleSignInButton
                        onPress={handleGoogleLogin}
                        loading={isGoogleLoading}
                        disabled={isLoading}
                        testID="google-signin-button"
                    />
                </View>
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>{t("auth.login.footerText")} </Text>
                    <TouchableOpacity onPress={() => router.push("/signup")} disabled={isBusy}>
                        <Text style={[styles.registerLink, isBusy && { opacity: 0.5 }]}>{t("auth.login.registerLink")}</Text>
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
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.border,
    },
    dividerText: {
        color: Colors.textMuted,
        fontSize: 13,
        marginHorizontal: 12,
        textTransform: "lowercase",
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

