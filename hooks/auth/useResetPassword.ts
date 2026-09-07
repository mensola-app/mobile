import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import { AuthService } from "../../services/auth.service";
import { isApiError } from "@/utils/api.utils";

const useResetPassword = () => {
    const router = useRouter();

    const { ticket } = useLocalSearchParams<{ ticket: string }>();

    const [newPassword, setNewPassword] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            setError("Yeni şifreniz en az 6 karakter olmalıdır.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await AuthService.resetPassword({ newPassword, ticket });

            router.replace("/login");
        } catch (error) {
            if (isApiError(error)) {
                const apiErrorMessage = error.error?.message || error?.message;
                setError(apiErrorMessage || "Doğrulama yapılırken bir hatayla karşılaşıldı. Lütfen tekrar deneyiniz.");
            } else {
                setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
            setIsLoading(false);
        }
    };

    return { newPassword, setNewPassword, isLoading, error, handleResetPassword };
};

export { useResetPassword };
