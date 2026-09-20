export type ImportJobStatus = "queued" | "processing" | "completed" | "failed";

export interface ImportResponseDto {
    jobId: string;
    status: ImportJobStatus;
    totalItems: number;
}

export interface ImportFailedItem {
    movie: string;
    year?: number | null;
    error: string;
}

export interface ImportJobProgress {
    jobId: string;
    userId: string;
    status: ImportJobStatus;
    totalItems: number;
    processedItems: number;
    successCount: number;
    failedCount: number;
    watchedCount?: number;
    watchlistCount?: number;
    listsCount?: number;
    errors?: ImportFailedItem[];
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}
