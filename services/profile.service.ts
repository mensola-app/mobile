import { GetProfileRequest, GetProfileResponse, IUser, UpdateProfileResponse } from "@/types/user.types";
import { client } from "../api/client";
import { GetStatDetailsRequest, STAT_ENDPOINT_MAP, StatDetailsResponse, StatType } from "@/types/stat.types";
import * as SecureStore from "expo-secure-store";
import { uploadAsync, FileSystemUploadType } from "expo-file-system/legacy";
import { ApiResponse } from "@/types/api";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.mensola.app";

const ProfileService = {
    getProfile: async (data: GetProfileRequest): Promise<GetProfileResponse> => {
        return client.get<GetProfileResponse>(`/v1/users/${data.userId}`, { auth: true });
    },

    getStatDetails: async <T extends StatType>(data: GetStatDetailsRequest<T>): Promise<StatDetailsResponse<T>> => {
        const { statType, userId, page, limit } = data;
        return await client.get<StatDetailsResponse<T>>(`/v1${STAT_ENDPOINT_MAP[statType as StatType]}`, {
            auth: true,
            params: { userId, page, limit },
        });
    },

    uploadAvatar: async (localImageUri: string): Promise<ApiResponse<{ avatarUrl: string }>> => {
        const token = await SecureStore.getItemAsync("token");

        const uploadResult = await uploadAsync(`${BASE_URL}/v1/storage/upload/avatar`, localImageUri, {
            fieldName: "avatar",
            httpMethod: "POST",
            uploadType: FileSystemUploadType.MULTIPART,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        const parsedData = JSON.parse(uploadResult.body);

        if (uploadResult.status >= 400 || !parsedData.success) {
            throw parsedData || new Error("Görsel yüklenemedi");
        }

        return parsedData;
    },

    editProfile: async (data: Pick<IUser, "fullname" | "bio" | "avatar">): Promise<UpdateProfileResponse> => {
        return await client.patch<UpdateProfileResponse>("/v1/users/me", data, { auth: true });
    },
};

export { ProfileService };
