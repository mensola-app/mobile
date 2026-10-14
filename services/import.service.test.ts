import { ImportService, ImportUploadError } from "./import.service";
import { client } from "@/api/client";
import { uploadAsync, getInfoAsync, FileSystemUploadType } from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";

jest.mock("@/api/client", () => ({
    client: {
        post: jest.fn(),
        get: jest.fn(),
    },
    getActiveLanguage: jest.fn().mockReturnValue("tr"),
}));

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
}));

jest.mock("expo-file-system/legacy", () => ({
    uploadAsync: jest.fn(),
    getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 1024 }),
    FileSystemUploadType: {
        MULTIPART: 1,
    },
}));

jest.mock("i18next", () => ({
    t: jest.fn((key: string, options?: any) => {
        if (options?.defaultValue) {
            return options.defaultValue;
        }
        return key;
    }),
}));

describe("ImportService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 1024 });
    });

    describe("uploadLetterboxdZip", () => {
        it("should throw error if file is larger than 50MB from file object", async () => {
            const largeFile = {
                uri: "file:///path/to/large.zip",
                name: "large.zip",
                size: 51 * 1024 * 1024,
            };

            await expect(ImportService.uploadLetterboxdZip(largeFile)).rejects.toThrow(
                "Dosya boyutu 50MB'dan büyük olamaz.",
            );
            expect(uploadAsync).not.toHaveBeenCalled();
        });

        it("should throw error if getInfoAsync reveals file is larger than 50MB", async () => {
            (getInfoAsync as jest.Mock).mockResolvedValueOnce({
                exists: true,
                size: 55 * 1024 * 1024,
            });

            const fileWithoutSize = {
                uri: "file:///path/to/hidden_large.zip",
                name: "hidden_large.zip",
            };

            await expect(ImportService.uploadLetterboxdZip(fileWithoutSize)).rejects.toThrow(
                "Dosya boyutu 50MB'dan büyük olamaz.",
            );
            expect(uploadAsync).not.toHaveBeenCalled();
        });

        it("should throw error if getInfoAsync reports file does not exist", async () => {
            (getInfoAsync as jest.Mock).mockResolvedValueOnce({
                exists: false,
            });

            const missingFile = {
                uri: "file:///path/to/missing.zip",
                name: "missing.zip",
            };

            await expect(ImportService.uploadLetterboxdZip(missingFile)).rejects.toThrow(
                "Seçilen dosya bulunamadı veya okunamadı.",
            );
            expect(uploadAsync).not.toHaveBeenCalled();
        });

        it("should upload via uploadAsync and return job details on success", async () => {
            const validFile = {
                uri: "file:///path/to/export.zip",
                name: "export.zip",
                mimeType: "application/zip",
                size: 1024 * 100, // 100KB
            };

            (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("test-token");
            (uploadAsync as jest.Mock).mockResolvedValueOnce({
                status: 200,
                body: JSON.stringify({
                    success: true,
                    data: {
                        jobId: "test-job-123",
                        status: "queued",
                        totalItems: 42,
                    },
                }),
            });

            const result = await ImportService.uploadLetterboxdZip(validFile);

            expect(uploadAsync).toHaveBeenCalledWith(
                expect.stringContaining("/v1/imports/letterboxd"),
                validFile.uri,
                expect.objectContaining({
                    fieldName: "file",
                    httpMethod: "POST",
                    uploadType: FileSystemUploadType.MULTIPART,
                    mimeType: "application/zip",
                    headers: expect.objectContaining({
                        Authorization: "Bearer test-token",
                        "Accept-Language": "tr",
                    }),
                }),
            );
            expect(result.jobId).toBe("test-job-123");
            expect(result.status).toBe("queued");
            expect(result.totalItems).toBe(42);
        });

        it("should throw 413 error if server returns status 413 (Payload Too Large)", async () => {
            const validFile = {
                uri: "file:///path/to/export.zip",
                name: "export.zip",
            };

            (uploadAsync as jest.Mock).mockResolvedValueOnce({
                status: 413,
                body: "Payload Too Large",
            });

            const errorPromise = ImportService.uploadLetterboxdZip(validFile);
            await expect(errorPromise).rejects.toThrow("Dosya boyutu 50MB'dan büyük olamaz.");
            await expect(errorPromise).rejects.toMatchObject({
                status: 413,
                code: "FILE_TOO_LARGE",
            });
        });

        it("should throw rate limit error if server returns status 429", async () => {
            const validFile = {
                uri: "file:///path/to/export.zip",
                name: "export.zip",
            };

            (uploadAsync as jest.Mock).mockResolvedValueOnce({
                status: 429,
                body: "Too Many Requests",
            });

            const errorPromise = ImportService.uploadLetterboxdZip(validFile);
            await expect(errorPromise).rejects.toThrow(
                "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.",
            );
            await expect(errorPromise).rejects.toMatchObject({
                status: 429,
                code: "RATE_LIMITED",
            });
        });

        it("should throw timeout error if upload exceeds timeout", async () => {
            const validFile = {
                uri: "file:///path/to/export.zip",
                name: "export.zip",
            };

            // Hanging uploadAsync promise
            (uploadAsync as jest.Mock).mockImplementationOnce(
                () => new Promise((resolve) => setTimeout(resolve, 500)),
            );

            // Pass short timeoutMs for testing (10ms)
            await expect(ImportService.uploadLetterboxdZip(validFile, 10)).rejects.toThrow(
                "Yükleme zaman aşımına uğradı. Lütfen tekrar deneyin.",
            );
        });

        it("should throw error if API returns failure", async () => {
            const validFile = {
                uri: "file:///path/to/export.zip",
                name: "export.zip",
            };

            (uploadAsync as jest.Mock).mockResolvedValueOnce({
                status: 400,
                body: JSON.stringify({
                    success: false,
                    message: "Invalid zip file",
                }),
            });

            await expect(ImportService.uploadLetterboxdZip(validFile)).rejects.toThrow(
                "Invalid zip file",
            );
        });

        it("should throw invalid server response error if response is not valid JSON", async () => {
            const validFile = {
                uri: "file:///path/to/export.zip",
                name: "export.zip",
            };

            (uploadAsync as jest.Mock).mockResolvedValueOnce({
                status: 502,
                body: "Bad Gateway",
            });

            await expect(ImportService.uploadLetterboxdZip(validFile)).rejects.toThrow(
                "Sunucudan geçersiz yanıt alındı.",
            );
        });

        it("should throw fallback upload failed error if response has no message", async () => {
            const validFile = {
                uri: "file:///path/to/export.zip",
                name: "export.zip",
            };

            (uploadAsync as jest.Mock).mockResolvedValueOnce({
                status: 400,
                body: JSON.stringify({
                    success: false,
                }),
            });

            await expect(ImportService.uploadLetterboxdZip(validFile)).rejects.toThrow(
                "Dosya yüklenemedi.",
            );
        });
    });

    describe("getImportProgress", () => {
        it("should get import progress for a jobId", async () => {
            const mockProgress = {
                jobId: "test-job-123",
                userId: "user-1",
                status: "processing",
                totalItems: 50,
                processedItems: 25,
                successCount: 24,
                failedCount: 1,
                createdAt: "2026-09-20T12:00:00Z",
                updatedAt: "2026-09-20T12:00:10Z",
            };

            (client.get as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: mockProgress,
            });

            const result = await ImportService.getImportProgress("test-job-123");

            expect(client.get).toHaveBeenCalledWith("/v1/imports/test-job-123", {
                auth: true,
            });
            expect(result).toEqual(mockProgress);
        });
    });

    describe("importSpotifyPlaylists", () => {
        it("should post playlist URLs and return queued job details", async () => {
            const mockResponse = {
                jobId: "spotify-job-456",
                status: "queued",
                totalItems: 2,
                type: "spotify",
            };

            (client.post as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: mockResponse,
            });

            const urls = [
                "https://open.spotify.com/playlist/5XzIwoEzc7KWg250ua37Ew",
                "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M",
            ];

            const result = await ImportService.importSpotifyPlaylists(urls);

            expect(client.post).toHaveBeenCalledWith(
                "/v1/imports/spotify",
                { urls },
                { auth: true },
            );
            expect(result).toEqual(mockResponse);
        });

        it("should throw rate limit error if API returns 429", async () => {
            (client.post as jest.Mock).mockRejectedValueOnce({
                status: 429,
                message: "Rate limit exceeded",
            });

            const errorPromise = ImportService.importSpotifyPlaylists([
                "https://open.spotify.com/playlist/test",
            ]);
            await expect(errorPromise).rejects.toThrow(
                "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.",
            );
            await expect(errorPromise).rejects.toMatchObject({
                status: 429,
                code: "RATE_LIMITED",
            });
        });

        it("should throw error if API returns unsuccessful response", async () => {
            (client.post as jest.Mock).mockResolvedValueOnce({
                success: false,
                message: "No valid playlists",
            });

            await expect(
                ImportService.importSpotifyPlaylists(["https://open.spotify.com/playlist/invalid"]),
            ).rejects.toBeDefined();
        });
    });
});
