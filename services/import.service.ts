import * as SecureStore from "expo-secure-store";
import { uploadAsync, getInfoAsync, FileSystemUploadType } from "expo-file-system/legacy";
import i18n from "i18next";
import { client, getActiveLanguage } from "@/lib/http/client";
import { ApiResponse } from "@/types/api";
import { ImportJobProgress, ImportResponseDto } from "@/types/import.types";
import { API_BASE_URL as BASE_URL } from "@/constants/env";

export const MAX_ZIP_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const UPLOAD_TIMEOUT_MS = 60 * 1000; // 60s

export class ImportUploadError extends Error {
    code?: string;
    status?: number;
    error?: { message: string; code?: string };

    constructor(message: string, code?: string, status?: number) {
        super(message);
        this.name = "ImportUploadError";
        this.code = code;
        this.status = status;
        this.error = { message, code };
        Object.setPrototypeOf(this, ImportUploadError.prototype);
    }
}

export interface SelectedZipFile {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
}

export const ImportService = {
    /**
     * Uploads Letterboxd export ZIP file to Mensola API using native uploadAsync
     * with size verification via getInfoAsync, timeout protection, and robust status code handling.
     */
    uploadLetterboxdZip: async (
        file: SelectedZipFile,
        timeoutMs: number = UPLOAD_TIMEOUT_MS,
    ): Promise<ImportResponseDto> => {
        // 1. Initial size check if provided
        if (file.size && file.size > MAX_ZIP_FILE_SIZE) {
            throw new ImportUploadError(
                (typeof i18n.t === "function" &&
                    i18n.t("settings.letterboxdImport.fileTooLarge", {
                        defaultValue: "Dosya boyutu 50MB'dan büyük olamaz.",
                    })) ||
                    "FILE_TOO_LARGE",
                "FILE_TOO_LARGE",
                413,
            );
        }

        // 2. Verify file on local filesystem
        try {
            const fileInfo = await getInfoAsync(file.uri);
            if (!fileInfo.exists) {
                throw new ImportUploadError(
                    (typeof i18n.t === "function" &&
                        i18n.t("settings.letterboxdImport.fileNotFound", {
                            defaultValue: "Seçilen dosya bulunamadı veya okunamadı.",
                        })) ||
                        "FILE_NOT_FOUND",
                    "FILE_NOT_FOUND",
                    404,
                );
            }
            if (typeof fileInfo.size === "number" && fileInfo.size > MAX_ZIP_FILE_SIZE) {
                throw new ImportUploadError(
                    (typeof i18n.t === "function" &&
                        i18n.t("settings.letterboxdImport.fileTooLarge", {
                            defaultValue: "Dosya boyutu 50MB'dan büyük olamaz.",
                        })) ||
                        "FILE_TOO_LARGE",
                    "FILE_TOO_LARGE",
                    413,
                );
            }
        } catch (err) {
            if (err instanceof ImportUploadError) {
                throw err;
            }
            // Non-fatal if getInfoAsync is not supported for certain content URI schemes
        }

        const token = await SecureStore.getItemAsync("token");
        const activeLang = getActiveLanguage();

        // 3. Race upload against timeout
        let uploadTimer: ReturnType<typeof setTimeout> | null = null;
        const timeoutPromise = new Promise<never>((_, reject) => {
            uploadTimer = setTimeout(() => {
                reject(
                    new ImportUploadError(
                        (typeof i18n.t === "function" &&
                            i18n.t("settings.letterboxdImport.uploadTimeout", {
                                defaultValue: "Yükleme zaman aşımına uğradı. Lütfen tekrar deneyin.",
                            })) ||
                            "UPLOAD_TIMEOUT",
                        "UPLOAD_TIMEOUT",
                        408,
                    ),
                );
            }, timeoutMs);
            if (typeof (uploadTimer as any)?.unref === "function") {
                (uploadTimer as any).unref();
            }
        });

        let uploadResult: any;
        try {
            uploadResult = await Promise.race([
                uploadAsync(`${BASE_URL}/v1/imports/letterboxd`, file.uri, {
                    fieldName: "file",
                    httpMethod: "POST",
                    uploadType: FileSystemUploadType.MULTIPART,
                    mimeType: file.mimeType || "application/zip",
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        Accept: "application/json",
                        "Accept-Language": activeLang,
                    },
                }),
                timeoutPromise,
            ]);
        } finally {
            if (uploadTimer) {
                clearTimeout(uploadTimer);
            }
        }

        // 4. Handle specific HTTP status codes
        if (uploadResult.status === 413) {
            throw new ImportUploadError(
                (typeof i18n.t === "function" &&
                    i18n.t("settings.letterboxdImport.fileTooLarge", {
                        defaultValue: "Dosya boyutu 50MB'dan büyük olamaz.",
                    })) ||
                    "FILE_TOO_LARGE",
                "FILE_TOO_LARGE",
                413,
            );
        }

        if (uploadResult.status === 429) {
            throw new ImportUploadError(
                (typeof i18n.t === "function" &&
                    i18n.t("settings.letterboxdImport.rateLimited", {
                        defaultValue: "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.",
                    })) ||
                    "RATE_LIMITED",
                "RATE_LIMITED",
                429,
            );
        }

        let parsedData: any;
        try {
            parsedData = JSON.parse(uploadResult.body);
        } catch {
            throw new ImportUploadError(
                (typeof i18n.t === "function" &&
                    i18n.t("settings.letterboxdImport.invalidServerResponse", {
                        defaultValue: "Sunucudan geçersiz yanıt alındı.",
                    })) ||
                    "Sunucudan geçersiz yanıt alındı.",
                "INVALID_SERVER_RESPONSE",
                uploadResult.status,
            );
        }

        if (uploadResult.status >= 400 || !parsedData.success || !parsedData.data) {
            const fallbackMessage =
                (typeof i18n.t === "function" &&
                    i18n.t("settings.letterboxdImport.uploadFailed", {
                        defaultValue: "Dosya yüklenemedi.",
                    })) ||
                "Dosya yüklenemedi.";
            const errorMessage = parsedData?.message || parsedData?.error?.message || fallbackMessage;

            throw new ImportUploadError(errorMessage, parsedData?.error?.code || "UPLOAD_FAILED", uploadResult.status);
        }

        return parsedData.data;
    },

    /**
     * Fetches current progress of an import job.
     */
    getImportProgress: async (jobId: string): Promise<ImportJobProgress> => {
        const response = await client.get<ApiResponse<ImportJobProgress>>(`/v1/imports/${jobId}`, {
            auth: true,
        });

        if (!response.success || !response.data) {
            throw response || new Error("Failed to fetch progress");
        }

        return response.data;
    },

    /**
     * Imports Spotify playlists by sending public playlist URLs or IDs to the API.
     */
    importSpotifyPlaylists: async (urls: string[]): Promise<ImportResponseDto> => {
        try {
            const response = await client.post<ApiResponse<ImportResponseDto>>(
                `/v1/imports/spotify`,
                { urls },
                {
                    auth: true,
                },
            );

            if (!response.success || !response.data) {
                throw new ImportUploadError(
                    response?.message || "Failed to queue Spotify import",
                    (response as any)?.error?.code,
                    (response as any)?.status,
                );
            }

            return response.data;
        } catch (error: any) {
            if (error instanceof ImportUploadError) {
                throw error;
            }
            const status = error?.status || error?.response?.status;
            if (status === 429) {
                throw new ImportUploadError(
                    (typeof i18n.t === "function" &&
                        i18n.t("settings.spotifyImport.rateLimited", {
                            defaultValue: "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.",
                        })) ||
                        "RATE_LIMITED",
                    "RATE_LIMITED",
                    429,
                );
            }
            throw error;
        }
    },
};
