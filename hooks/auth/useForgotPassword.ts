import { useState } from "react";
import { useRouter } from "expo-router";

import { AuthService } from "../../services/auth.service";
import { isApiError } from "@/utils/api.utils";

const useForgotPassword = () => {
    const router = useRouter();

    const [email, setEmail] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleForgotPassword = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setError("Lütfen geçerli bir e-posta adresi giriniz.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await AuthService.forgotPassword({ email });

            router.replace({
                pathname: "/verify-reset-token",
                params: { email },
            });
        } catch (error) {
            if (isApiError(error)) {
                const apiErrorMessage = error.error?.message || error?.message;
                setError(apiErrorMessage || "E-posta gönderilirken bir hatayla karşılaşıldı. Lütfen tekrar deneyiniz.");
            } else {
                setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
            setIsLoading(false);
        }
    };

    return { email, setEmail, isLoading, error, handleForgotPassword };
};

export { useForgotPassword };
