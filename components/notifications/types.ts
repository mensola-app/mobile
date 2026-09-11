export type NotificationType = "follow_request" | "follow" | "like" | "review" | "comment";

export interface NotificationActor {
    id: string;
    username: string;
    fullName?: string;
    avatar?: string | null;
}

export interface NotificationTarget {
    id: string;
    type: "user" | "review" | "comment" | "movie_list" | "playlist";
    title?: string;
    image?: string | null;
}

export interface NotificationItem {
    id: string;
    type: NotificationType;
    actor: NotificationActor;
    message?: string;
    target?: NotificationTarget;
    createdAt: string;
    isRead: boolean;
    entityId?: string;
    status?: "pending" | "accepted" | "declined";
}

export interface NotificationRowProps {
    item: NotificationItem;
    onPress?: (item: NotificationItem) => void;
    onPressActor?: (actorId: string) => void;
}

export interface FollowRequestRowProps {
    item: NotificationItem;
    onAccept?: (id: string) => void;
    onDecline?: (id: string) => void;
    onPressActor?: (actorId: string) => void;
    isLoading?: boolean;
}

export interface NotificationEmptyStateProps {
    title?: string;
    message?: string;
    onRefresh?: () => void;
}

export interface NotificationsViewProps {
    notifications: NotificationItem[];
    refreshing?: boolean;
    onRefresh?: () => Promise<void> | void;
    onAcceptRequest?: (id: string) => Promise<void> | void;
    onDeclineRequest?: (id: string) => Promise<void> | void;
    onPressNotification?: (item: NotificationItem) => void;
    onPressActor?: (actorId: string) => void;
}
