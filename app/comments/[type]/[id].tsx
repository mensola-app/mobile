import React from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { EntityInteractionsView } from "@/components/EntityInteractions";
import { useEntityInteractions } from "@/hooks/interactions/useEntityInteractions";
import { Colors } from "@/constants/colors";

export default function EntityInteractionsPage() {
    const { t } = useTranslation();
    const { type, id, title } = useLocalSearchParams<{
        type: string;
        id: string;
        title?: string;
    }>();

    const {
        interactions,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        isRefetching,
        error,
        fetchNextPage,
        refetch,
    } = useEntityInteractions(type, id);

    const getHeaderTitle = () => {
        if (title) return title;
        const normalized = type?.toLowerCase();
        if (normalized === "movie") return t("comments.movieInteractionsTitle", "Film Yorumları");
        if (normalized === "track") return t("comments.trackInteractionsTitle", "Şarkı Yorumları");
        if (normalized === "album") return t("comments.albumInteractionsTitle", "Albüm Yorumları");
        if (normalized === "playlist") return t("comments.playlistInteractionsTitle", "Çalma Listesi Yorumları");
        return t("comments.interactionsTitle", "Yorumlar & Değerlendirmeler");
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <Stack.Screen
                options={{
                    title: getHeaderTitle(),
                }}
            />
            <EntityInteractionsView
                type={type}
                id={id}
                interactions={interactions}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                isRefetching={isRefetching}
                error={error}
                onEndReached={fetchNextPage}
                onRefresh={refetch}
            />
        </View>
    );
}
