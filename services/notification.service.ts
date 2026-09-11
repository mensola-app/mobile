import { client } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { NotificationItem } from "@/components/notifications/types";

export interface NotificationsData {
    notifications?: NotificationItem[];
    followRequests?: NotificationItem[];
}

export type NotificationsResponse = ApiResponse<NotificationsData>;

export const notificationService = {
    getNotifications: async (): Promise<NotificationsResponse> => {
        return await client.get<NotificationsResponse>("/v1/notifications", { auth: true });
    },

    acceptFollowRequest: async (requesterId: string): Promise<ApiResponse<{ status: "accepted" }>> => {
        return await client.post<ApiResponse<{ status: "accepted" }>>(
            `/v1/users/follow-requests/${requesterId}/accept`,
            {},
            { auth: true }
        );
    },

    declineFollowRequest: async (requesterId: string): Promise<ApiResponse<{ status: "declined" }>> => {
        return await client.post<ApiResponse<{ status: "declined" }>>(
            `/v1/users/follow-requests/${requesterId}/decline`,
            {},
            { auth: true }
        );
    },

    markAsRead: async (notificationId: string): Promise<ApiResponse> => {
        return await client.patch<ApiResponse>(`/v1/notifications/${notificationId}/read`, {}, { auth: true });
    },

    markAllAsRead: async (): Promise<ApiResponse> => {
        return await client.patch<ApiResponse>("/v1/notifications/read-all", {}, { auth: true });
    },
};
