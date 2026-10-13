import React from "react";
import { View, FlatList, RefreshControl } from "react-native";

import NotificationRow from "./NotificationRow";
import FollowRequestRow from "./FollowRequestRow";
import NotificationEmptyState from "./NotificationEmptyState";
import { NotificationItem, NotificationsViewProps } from "./types";
import { styles } from "./styles";
import { Colors } from "@/constants/colors";

export default function NotificationsView({
    notifications,
    refreshing = false,
    onRefresh,
    onAcceptRequest,
    onDeclineRequest,
    onPressNotification,
    onPressActor,
}: NotificationsViewProps) {
    const renderItem = ({ item }: { item: NotificationItem }) => {
        if (item.type === "follow_request") {
            return (
                <FollowRequestRow
                    item={item}
                    onAccept={onAcceptRequest}
                    onDecline={onDeclineRequest}
                    onPressActor={onPressActor}
                />
            );
        }

        return (
            <NotificationRow
                item={item}
                onPress={onPressNotification}
                onPressActor={onPressActor}
            />
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<NotificationEmptyState />}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.primary}
                            colors={[Colors.primary]}
                        />
                    ) : undefined
                }
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={7}
                testID="notifications-flatlist"
            />
        </View>
    );
}
