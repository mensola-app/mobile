import { useState } from "react";
import { useRouter } from "expo-router";
import { useGlobalUser } from "../../context/AuthContext";
import { AuthService } from "../../services/auth.service";
import { isApiError } from "@/utils/api.utils";

const useRegister = () => {
    const { login } = useGlobalUser();
    const router = useRouter();

    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            setError("Lütfen tüm alanları doldurun.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Lütfen geçerli bir e-posta adresi giriniz.");
            return;
        }

        if (password.length < 6) {
            setError("Şifreniz en az 6 karakter olmalıdır.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Şifreler birbiriyle eşleşmiyor.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await AuthService.register({ username, email, password });

            if (!response.data?.accessToken || !response.data?.refreshToken || !response.data?.user) {
                throw new Error("Giriş yapılırken bir hatayla karşılaşıldı. Lütfen tekrar deneyiniz.");
            }

            const { user, accessToken, refreshToken } = response.data;

            await login({ accessToken, refreshToken }, user);

            router.replace("/home");
        } catch (error) {
            if (isApiError(error)) {
                const apiErrorMessage = error.error?.message || error?.message;
                setError(apiErrorMessage || "Kayıt yapılırken bir hatayla karşılaşıldı. Lütfen tekrar deneyiniz.");
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
            setIsLoading(false);
        }
    };

    return {
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
    };
};

export { useRegister };
