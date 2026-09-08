import * as SecureStore from "expo-secure-store";
import { uploadAsync, FileSystemUploadType } from "expo-file-system/legacy";
import { ApiResponse } from "@/types/api";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.mensola.app";

export const StorageService = {
    uploadCover: async (localImageUri: string): Promise<ApiResponse<{ imageUrl: string; coverUrl: string }>> => {
        const token = await SecureStore.getItemAsync("token");

        const uploadResult = await uploadAsync(`${BASE_URL}/v1/storage/upload/cover`, localImageUri, {
            fieldName: "cover",
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
};
