export type ImportType = "letterboxd" | "spotify";

export type ImportJobStatus = "queued" | "processing" | "completed" | "failed";

export interface ImportResponseDto {
    jobId: string;
    status: ImportJobStatus;
    totalItems: number;
    type?: ImportType;
}

export interface ImportFailedItem {
    movie?: string;
    playlist?: string;
    year?: number | null;
    error: string;
}

export interface ImportJobProgress {
    jobId: string;
    userId: string;
    status: ImportJobStatus;
    type?: ImportType;
    totalItems: number;
    processedItems: number;
    successCount: number;
    failedCount: number;
    watchedCount?: number;
    watchlistCount?: number;
    listsCount?: number;
    playlistsCount?: number;
    tracksCount?: number;
    errors?: ImportFailedItem[];
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}
