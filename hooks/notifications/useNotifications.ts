import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService, NotificationsData } from "@/services/notification.service";
import { NotificationItem } from "@/components/notifications/types";

export interface UseNotificationsReturn {
    notifications: NotificationItem[];
    isLoading: boolean;
    isRefetching: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    acceptRequest: (id: string) => Promise<void>;
    declineRequest: (id: string) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
    const queryClient = useQueryClient();

    const { data, isLoading, isRefetching, error, refetch } = useQuery<NotificationsData>({
        queryKey: ["notifications"],
        queryFn: async () => {
            const response = await notificationService.getNotifications();
            if (!response.success || !response.data) {
                throw new Error("Bildirimler yüklenirken bir sorun oluştu.");
            }
            return response.data;
        },
    });

    const acceptMutation = useMutation({
        mutationFn: async (requesterId: string) => {
            return await notificationService.acceptFollowRequest(requesterId);
        },
        onMutate: async (requesterId: string) => {
            await queryClient.cancelQueries({ queryKey: ["notifications"] });
            const previousData = queryClient.getQueryData<NotificationsData>(["notifications"]);

            if (previousData) {
                const updateItem = (item: NotificationItem) =>
                    item.id === requesterId || item.actor?.id === requesterId
                        ? { ...item, status: "accepted" as const }
                        : item;

                queryClient.setQueryData<NotificationsData>(["notifications"], {
                    ...previousData,
                    notifications: previousData.notifications?.map(updateItem),
                    followRequests: previousData.followRequests?.map(updateItem),
                });
            }

            return { previousData };
        },
        onError: (_err, _requesterId, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(["notifications"], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["homeData"] });
        },
    });

    const declineMutation = useMutation({
        mutationFn: async (requesterId: string) => {
            return await notificationService.declineFollowRequest(requesterId);
        },
        onMutate: async (requesterId: string) => {
            await queryClient.cancelQueries({ queryKey: ["notifications"] });
            const previousData = queryClient.getQueryData<NotificationsData>(["notifications"]);

            if (previousData) {
                const updateItem = (item: NotificationItem) =>
                    item.id === requesterId || item.actor?.id === requesterId
                        ? { ...item, status: "declined" as const }
                        : item;

                queryClient.setQueryData<NotificationsData>(["notifications"], {
                    ...previousData,
                    notifications: previousData.notifications?.map(updateItem),
                    followRequests: previousData.followRequests?.map(updateItem),
                });
            }

            return { previousData };
        },
        onError: (_err, _requesterId, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(["notifications"], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["homeData"] });
        },
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (notificationId: string) => {
            return await notificationService.markAsRead(notificationId);
        },
        onMutate: async (notificationId: string) => {
            await queryClient.cancelQueries({ queryKey: ["notifications"] });
            const previousData = queryClient.getQueryData<NotificationsData>(["notifications"]);

            if (previousData) {
                const markItem = (item: NotificationItem) =>
                    item.id === notificationId ? { ...item, isRead: true } : item;

                queryClient.setQueryData<NotificationsData>(["notifications"], {
                    ...previousData,
                    notifications: previousData.notifications?.map(markItem),
                    followRequests: previousData.followRequests?.map(markItem),
                });
            }

            return { previousData };
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            return await notificationService.markAllAsRead();
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["notifications"] });
            const previousData = queryClient.getQueryData<NotificationsData>(["notifications"]);

            if (previousData) {
                const markAll = (item: NotificationItem) => ({ ...item, isRead: true });

                queryClient.setQueryData<NotificationsData>(["notifications"], {
                    ...previousData,
                    notifications: previousData.notifications?.map(markAll),
                    followRequests: previousData.followRequests?.map(markAll),
                });
            }

            return { previousData };
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const notifications: NotificationItem[] = data?.notifications ?? data?.followRequests ?? [];

    const handleRefetch = async () => {
        await refetch();
    };

    const handleAcceptRequest = async (id: string) => {
        await acceptMutation.mutateAsync(id);
    };

    const handleDeclineRequest = async (id: string) => {
        await declineMutation.mutateAsync(id);
    };

    const handleMarkAsRead = async (id: string) => {
        await markAsReadMutation.mutateAsync(id);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsReadMutation.mutateAsync();
    };

    return {
        notifications,
        isLoading,
        isRefetching,
        error: error ? (error instanceof Error ? error.message : "Sunucuya bağlanılamadı.") : null,
        refetch: handleRefetch,
        acceptRequest: handleAcceptRequest,
        declineRequest: handleDeclineRequest,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
    };
};
