import React from "react";
import { useTranslation } from "react-i18next";

import EmptyState from "@/components/EmptyState";
import { NotificationEmptyStateProps } from "./types";

export default function NotificationEmptyState({ title, message }: NotificationEmptyStateProps) {
    const { t } = useTranslation();

    const displayTitle = title || t("notifications.emptyTitle");
    const displayMessage = message || t("notifications.emptySubtitle");

    return (
        <EmptyState
            testID="notification-empty-state"
            icon="notifications-outline"
            title={displayTitle}
            subtitle={displayMessage}
        />
    );
}
