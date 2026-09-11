import { ApiResponse } from "./api";
import { IUser } from "./user.types";

export type AccessToken = string;
export type RefreshToken = string;
export type AuthTokens = {
    accessToken: AccessToken;
    refreshToken: RefreshToken;
};
export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { username: string; email: string; password: string };
export type LogoutRequest = { refreshToken?: RefreshToken; pushToken?: string };
export type ForgotPasswordRequest = { email: string };
export type VerifyResetTokenRequest = { email: string; code: string };
export type ResetPasswordRequest = { ticket: string; newPassword: string };
export type AuthResponseData = AuthTokens & { user?: IUser };
export type AuthResponse = ApiResponse<AuthResponseData>;
export type VerifyResetCodeResponseData = { ticket: string };
export type VerifyResetCodeResponse = ApiResponse<VerifyResetCodeResponseData>;
export type GoogleLoginRequest = { idToken: string };
