import { GoogleSignin, statusCodes, isErrorWithCode } from "@react-native-google-signin/google-signin";
import { AuthService } from "./auth.service";
import { AuthResponse } from "@/types/auth.types";

/**
 * Google Sign-In yapılandırmasını başlatır.
 * Uygulama açılışında bir kez çağrılmalıdır.
 */
export function configureGoogleSignIn(): void {
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
}

export type GoogleSignInResult =
    | { success: true; data: AuthResponse }
    | { success: false; cancelled: true }
    | { success: false; cancelled: false; message: string };

/**
 * Google Sign-In akışını yürütür:
 * 1. Play Services kontrolü
 * 2. Google Sign-In popup'ı
 * 3. idToken → backend POST /v1/auth/google
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        const response = await GoogleSignin.signIn();

        const idToken = response.data?.idToken;

        if (!idToken) {
            return {
                success: false,
                cancelled: false,
                message: "Google'dan kimlik bilgisi alınamadı.",
            };
        }

        const authResponse = await AuthService.googleLogin({ idToken });

        return { success: true, data: authResponse };
    } catch (error: unknown) {
        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    return { success: false, cancelled: true };

                case statusCodes.IN_PROGRESS:
                    return { success: false, cancelled: true };

                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    return {
                        success: false,
                        cancelled: false,
                        message: "Google Play Hizmetleri bu cihazda mevcut değil veya güncel değil.",
                    };

                default:
                    return {
                        success: false,
                        cancelled: false,
                        message: "Google ile giriş yapılırken bir hata oluştu.",
                    };
            }
        }

        // API error (backend)
        if (
            typeof error === "object" &&
            error !== null &&
            "success" in error &&
            (error as { success: boolean }).success === false
        ) {
            const apiErr = error as { error?: { message?: string }; message?: string };
            return {
                success: false,
                cancelled: false,
                message: apiErr.error?.message || apiErr.message || "Google ile giriş yapılamadı.",
            };
        }

        return {
            success: false,
            cancelled: false,
            message: "Google ile giriş yapılırken beklenmeyen bir hata oluştu.",
        };
    }
}
