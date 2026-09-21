import * as SecureStore from "expo-secure-store";
import { uploadAsync, FileSystemUploadType } from "expo-file-system/legacy";
import { client, getActiveLanguage } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { ImportJobProgress, ImportResponseDto } from "@/types/import.types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.mensola.app";

export interface SelectedZipFile {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
}

export const ImportService = {
    /**
     * Uploads Letterboxd export ZIP file to Mensola API using native uploadAsync
     * to avoid React Native Android "Unsupported FormDataPart implementation" error.
     */
    uploadLetterboxdZip: async (file: SelectedZipFile): Promise<ImportResponseDto> => {
        if (file.size && file.size > 50 * 1024 * 1024) {
            throw new Error("FILE_TOO_LARGE");
        }

        const token = await SecureStore.getItemAsync("token");
        const activeLang = getActiveLanguage();

        const uploadResult = await uploadAsync(
            `${BASE_URL}/v1/imports/letterboxd`,
            file.uri,
            {
                fieldName: "file",
                httpMethod: "POST",
                uploadType: FileSystemUploadType.MULTIPART,
                mimeType: file.mimeType || "application/zip",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    Accept: "application/json",
                    "Accept-Language": activeLang,
                },
            },
        );

        let parsedData: any;
        try {
            parsedData = JSON.parse(uploadResult.body);
        } catch {
            throw new Error("Sunucudan geçersiz yanıt alındı.");
        }

        if (uploadResult.status >= 400 || !parsedData.success || !parsedData.data) {
            const errorMessage =
                parsedData?.message ||
                parsedData?.error?.message ||
                "Dosya yüklenemedi.";
            const error = new Error(errorMessage);
            (error as any).error = parsedData?.error || { message: errorMessage };
            throw error;
        }

        return parsedData.data;
    },

    /**
     * Fetches current progress of an import job.
     */
    getImportProgress: async (jobId: string): Promise<ImportJobProgress> => {
        const response = await client.get<ApiResponse<ImportJobProgress>>(
            `/v1/imports/${jobId}`,
            {
                auth: true,
            },
        );

        if (!response.success || !response.data) {
            throw response || new Error("Failed to fetch progress");
        }

        return response.data;
    },

    /**
     * Imports Spotify playlists by sending public playlist URLs or IDs to the API.
     */
    importSpotifyPlaylists: async (urls: string[]): Promise<ImportResponseDto> => {
        const response = await client.post<ApiResponse<ImportResponseDto>>(
            `/v1/imports/spotify`,
            { urls },
            {
                auth: true,
            },
        );

        if (!response.success || !response.data) {
            throw response || new Error("Failed to queue Spotify import");
        }

        return response.data;
    },
};
