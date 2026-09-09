import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import i18n from "i18next";
import { useGlobalUser } from "@/context/AuthContext";
import { AuthService } from "@/services/auth.service";
import { isApiError } from "@/utils/api.utils";

const useLogin = () => {
    const { login } = useGlobalUser();
    const router = useRouter();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Lütfen tüm alanları doldurun.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Lütfen geçerli bir e-posta adresi giriniz.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await AuthService.login({ email, password });

            if (!response.data?.accessToken || !response.data?.refreshToken || !response.data?.user) {
                throw new Error("Giriş yapılırken bir hatayla karşılaşıldı. Lütfen tekrar deneyiniz.");
            }

            const { user, accessToken, refreshToken } = response.data;

            await login({ accessToken, refreshToken }, user);

            router.replace("/home");
        } catch (error) {
            console.log(error);
            if (isApiError(error)) {
                if (error.error?.code === "ACCOUNT_SOFT_DELETED") {
                    Alert.alert(
                        "Hesap Silinme Sürecinde",
                        "Hesabınız silinme sürecindedir. Yeniden etkinleştirmek istiyor musunuz?",
                        [
                            { text: "İptal", style: "cancel" },
                            {
                                text: "Yeniden Etkinleştir",
                                onPress: async () => {
                                    setIsLoading(true);
                                    try {
                                        const response = await AuthService.reactivate({ email, password });
                                        if (!response.data?.accessToken || !response.data?.refreshToken || !response.data?.user) {
                                            throw new Error("Yeniden etkinleştirme başarısız oldu.");
                                        }
                                        const { user, accessToken, refreshToken } = response.data;
                                        await login({ accessToken, refreshToken }, user);
                                        router.replace("/home");
                                    } catch (reactivateError: any) {
                                        setIsLoading(false);
                                        Alert.alert(
                                            "Hata",
                                            reactivateError?.error?.message || reactivateError?.message || "Hesap etkinleştirilemedi."
                                        );
                                    }
                                }
                            }
                        ]
                    );
                    return;
                }

                if (error.error?.code === "OAUTH_ACCOUNT_NO_PASSWORD") {
                    const apiErrorMessage = error.error?.message || error?.message;
                    Alert.alert(
                        i18n.t("common.error"),
                        apiErrorMessage,
                        [
                            { text: i18n.t("common.ok"), style: "cancel" },
                            {
                                text: i18n.t("auth.login.forgotPasswordText"),
                                onPress: () => router.push("/forgot-password"),
                            },
                        ]
                    );
                    setIsLoading(false);
                    return;
                }

                const apiErrorMessage = error.error?.message || error?.message;
                setError(apiErrorMessage || "Giriş yapılırken bir hatayla karşılaşıldı. Lütfen tekrar deneyiniz.");
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
            setIsLoading(false);
        }
    };

    return { email, setEmail, password, setPassword, isLoading, error, handleLogin };
};

export { useLogin };
