import * as SecureStore from "expo-secure-store";
import { uploadAsync, FileSystemUploadType } from "expo-file-system/legacy";
import { ApiResponse } from "@/types/api";
import { API_BASE_URL as BASE_URL } from "@/constants/env";
import i18n from "i18next";

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
            const fallbackMessage =
                (typeof i18n.t === "function" &&
                    i18n.t("common.imageUploadError", {
                        defaultValue: "Görsel yüklenemedi",
                    })) ||
                "Görsel yüklenemedi";
            throw parsedData || new Error(fallbackMessage);
        }

        return parsedData;
    },
};
