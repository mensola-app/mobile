import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import { AuthService } from "../../services/auth.service";
import { isApiError } from "@/utils/api.utils";

const useVerifyResetCode = () => {
    const router = useRouter();

    const { email } = useLocalSearchParams<{ email: string }>();

    const [code, setCode] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleVerifyToken = async () => {
        if (!code || code.length < 6) {
            setError("Lütfen geçerli bir doğrulama kodu giriniz.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await AuthService.verifyResetCode({ email, code });
            if (!response.data?.ticket) {
                throw new Error("Kod doğrulanırken bir hatayla karşılaşıldı. Lütfen tekrar deneyiniz.");
            }

            const ticket = response.data.ticket;

            router.replace({
                pathname: "/reset-password",
                params: { ticket },
            });
        } catch (error) {
            if (isApiError(error)) {
                const apiErrorMessage = error.error?.message || error?.message;
                setError(apiErrorMessage || "Doğrulama yapılırken bir hatayla karşılaşıldı. Lütfen tekrar deneyiniz.");
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
            setIsLoading(false);
        }
    };

    return { code, setCode, isLoading, error, handleVerifyToken };
};

export { useVerifyResetCode };
