import { FollowActionResponse, UpdateUsernameResponse } from "@/types/user.types";
import { client } from "../api/client";
import { UserId } from "@/types/common.types";

const UserService = {
    follow: async (targetUserId: UserId): Promise<FollowActionResponse> => {
        return await client.post<FollowActionResponse>(`/v1/users/${targetUserId}/follow`, {}, { auth: true });
    },

    unfollow: async (targetUserId: UserId): Promise<FollowActionResponse> => {
        return await client.delete(`/v1/users/${targetUserId}/follow`, { auth: true });
    },

    checkUsername: async (username: string): Promise<{ data: { available: boolean } }> => {
        return await client.get(`/v1/users/check-username`, { params: { username } });
    },

    changeUsername: async (username: string): Promise<UpdateUsernameResponse> => {
        return await client.patch<UpdateUsernameResponse>("/v1/users/username", { username }, { auth: true });
    },

    requestEmailChange: async (email: string, password?: string): Promise<any> => {
        return await client.post("/v1/users/email/request", { email, password }, { auth: true });
    },

    verifyEmailChange: async (email: string, code: string): Promise<any> => {
        return await client.post("/v1/users/email/verify", { email, code }, { auth: true });
    },

    changePassword: async (currentPassword?: string, newPassword?: string): Promise<any> => {
        return await client.patch("/v1/users/password", { currentPassword, newPassword }, { auth: true });
    },

    updatePrivacy: async (isPrivate: boolean): Promise<any> => {
        return await client.patch("/v1/users/privacy", { isPrivate }, { auth: true });
    },

    deleteAccount: async (): Promise<any> => {
        return await client.delete("/v1/users/me", { auth: true });
    },

    searchUsers: async (params: { q: string; page?: number; limit?: number }): Promise<any> => {
        return await client.get("/v1/users/search", { params, auth: true });
    },
};

export { UserService };
