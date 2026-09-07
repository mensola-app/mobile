import { useEffect } from "react";
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TextField from "../../components/TextField";
import Button from "../../components/Button";

import { useForgotPassword } from "../../hooks/auth/useForgotPassword";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordScreen() {
    const { email, setEmail, isLoading, error, handleForgotPassword } = useForgotPassword();
    const { t } = useTranslation();

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
                        label={t("auth.forgotPassword.emailLabel")}
                        type="email"
                        placeholder={t("auth.forgotPassword.emailPlaceholder")}
                        value={email}
                        onChangeText={setEmail}
                        editable={!isLoading}
                    />
                    <Button
                        label={t("auth.forgotPassword.submitButton")}
                        onPress={handleForgotPassword}
                        loading={isLoading}
                        disabled={isLoading}
                    />
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
});
