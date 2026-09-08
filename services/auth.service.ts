import {
    AuthResponse,
    ForgotPasswordRequest,
    GoogleLoginRequest,
    LoginRequest,
    LogoutRequest,
    RegisterRequest,
    ResetPasswordRequest,
    VerifyResetCodeResponse,
    VerifyResetTokenRequest,
} from "@/types/auth.types";
import { client } from "../api/client";
import { ApiResponse } from "@/types/api";

const AuthService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        return await client.post<AuthResponse>("/v1/auth/login", data, { auth: false });
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        return await client.post<AuthResponse>("/v1/auth/register", data, { auth: false });
    },

    logout: async (data: LogoutRequest): Promise<ApiResponse> => {
        return await client.post<ApiResponse>("/v1/auth/logout", data, { auth: false });
    },

    forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
        return await client.post<ApiResponse>("/v1/auth/forgot-password", data, { auth: false });
    },

    verifyResetCode: async (data: VerifyResetTokenRequest): Promise<VerifyResetCodeResponse> => {
        return await client.post<VerifyResetCodeResponse>("/v1/auth/verify-reset-code", data, { auth: false });
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
        return await client.post<ApiResponse>("/v1/auth/reset-password", data, { auth: false });
    },

    reactivate: async (data: LoginRequest): Promise<AuthResponse> => {
        return await client.post<AuthResponse>("/v1/auth/reactivate", data, { auth: false });
    },

    googleLogin: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
        return await client.post<AuthResponse>("/v1/auth/google", data, { auth: false });
    },
};

export { AuthService };
