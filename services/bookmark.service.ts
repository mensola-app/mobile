import {
    ToggleBookmarkRequest,
    ToggleBookmarkResponse,
    UserBookmarksRequest,
    UserBookmarksResponse,
} from "@/types/bookmark.types";
import { client } from "@/lib/http/client";

export const BookmarkService = {
    toggleBookmark: async (data: ToggleBookmarkRequest): Promise<ToggleBookmarkResponse> => {
        return await client.post<ToggleBookmarkResponse>("/v1/bookmarks/toggle", data, { auth: true });
    },

    getUserBookmarks: async (data: UserBookmarksRequest): Promise<UserBookmarksResponse> => {
        return await client.get<UserBookmarksResponse>(`/v1/bookmarks`, { auth: true, params: { ...data } });
    },
};
