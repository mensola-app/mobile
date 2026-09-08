import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useGlobalUser } from "@/context/AuthContext";
import { signInWithGoogle } from "@/services/googleAuth.service";

const useGoogleLogin = () => {
    const { login } = useGlobalUser();
    const router = useRouter();
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            const result = await signInWithGoogle();

            if (!result.success) {
                if (result.cancelled) {
                    // Kullanıcı pencereyi kapattı veya işlem zaten sürüyordu — sessizce iptal
                    return;
                }
                Alert.alert(t("common.error"), result.message);
                return;
            }

            const { data: authResponse } = result;

            if (!authResponse.data?.accessToken || !authResponse.data?.refreshToken || !authResponse.data?.user) {
                Alert.alert(
                    t("common.error"),
                    t("auth.google.genericError")
                );
                return;
            }

            const { user, accessToken, refreshToken } = authResponse.data;

            await login({ accessToken, refreshToken }, user);

            router.replace("/home");
        } catch (error) {
            console.error("Google login unexpected error:", error);
            Alert.alert(t("common.error"), t("auth.google.genericError"));
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, handleGoogleLogin };
};

export { useGoogleLogin };
