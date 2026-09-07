import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import TextField from "../../components/TextField";
import Button from "../../components/Button";

import { useRegister } from "../../hooks/auth/useRegister";
import { Colors } from "@/constants/colors";

export default function SignupScreen() {
    const router = useRouter();
    const {
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        isLoading,
        error,
        handleRegister,
    } = useRegister();
    const { t } = useTranslation();
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

    useEffect(() => {
        if (isLoading) return;
        if (error) return Alert.alert(t("common.error"), error);
    }, [isLoading, error]);

    const handleSubmit = () => {
        if (!hasAcceptedTerms) {
            Alert.alert(t("common.warning"), t("auth.signup.termsRequired"));
            return;
        }
        handleRegister();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.logoText}>mensola</Text>
                    </View>

                    <View style={styles.formContainer} pointerEvents={isLoading ? "none" : "auto"}>
                        <TextField
                            label={t("auth.signup.usernameLabel")}
                            type="text"
                            placeholder={t("auth.signup.usernamePlaceholder")}
                            value={username}
                            onChangeText={setUsername}
                            editable={!isLoading}
                        />
                        <TextField
                            label={t("auth.signup.emailLabel")}
                            type="email"
                            placeholder={t("auth.signup.emailPlaceholder")}
                            value={email}
                            onChangeText={setEmail}
                            editable={!isLoading}
                        />
                        <TextField
                            label={t("auth.signup.passwordLabel")}
                            type="password"
                            placeholder={t("auth.signup.passwordPlaceholder")}
                            value={password}
                            onChangeText={setPassword}
                            editable={!isLoading}
                        />
                        <TextField
                            label={t("auth.signup.confirmPasswordLabel")}
                            type="password"
                            placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            editable={!isLoading}
                        />

                        {/* Terms & Privacy Consent */}
                        <View style={styles.consentContainer}>
                            <TouchableOpacity
                                style={styles.checkboxTouch}
                                onPress={() => setHasAcceptedTerms(!hasAcceptedTerms)}
                                activeOpacity={0.7}
                                disabled={isLoading}
                                testID="signup-terms-checkbox">
                                <Ionicons
                                    name={hasAcceptedTerms ? "checkbox" : "square-outline"}
                                    size={20}
                                    color={hasAcceptedTerms ? Colors.primary : Colors.textMuted}
                                />
                            </TouchableOpacity>
                            <Text style={styles.consentText}>
                                {t("auth.signup.consentPrefix")}{" "}
                                <Text
                                    style={styles.consentLink}
                                    onPress={() => Linking.openURL("https://mensola.app/terms")}
                                    testID="signup-terms-link">
                                    {t("auth.signup.termsOfService")}
                                </Text>{" "}
                                {t("auth.signup.consentAnd")}{" "}
                                <Text
                                    style={styles.consentLink}
                                    onPress={() => Linking.openURL("https://mensola.app/privacy-policy")}
                                    testID="signup-privacy-link">
                                    {t("auth.signup.privacyPolicy")}
                                </Text>
                                {t("auth.signup.consentSuffix") ? ` ${t("auth.signup.consentSuffix")}` : "."}
                            </Text>
                        </View>

                        <Button
                            label={t("auth.signup.submitButton")}
                            onPress={handleSubmit}
                            disabled={!hasAcceptedTerms || isLoading}
                            loading={isLoading}
                            style={!hasAcceptedTerms && !isLoading ? { opacity: 0.5 } : undefined}
                            testID="signup-submit-button"
                        />
                    </View>

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>{t("auth.signup.footerText")} </Text>
                        <TouchableOpacity onPress={() => router.push("/login")} disabled={isLoading}>
                            <Text style={[styles.loginLink, isLoading && { opacity: 0.5 }]}>{t("auth.signup.loginLink")}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    headerContainer: { alignItems: "center", marginBottom: 40 },
    logoText: {
        fontSize: 42,
        fontWeight: "bold",
        color: Colors.textPrimary,
        letterSpacing: 1.5,
    },
    formContainer: { marginBottom: 24 },
    consentContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 2,
    },
    checkboxTouch: {
        paddingTop: 1,
    },
    consentText: {
        flex: 1,
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    consentLink: {
        color: Colors.primary,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
    footerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    footerText: { color: Colors.textSecondary, fontSize: 14 },
    loginLink: { color: Colors.primary, fontSize: 14, fontWeight: "bold" },
});
