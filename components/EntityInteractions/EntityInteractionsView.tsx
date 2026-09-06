import React, { useCallback } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import DynamicList from "@/components/DynamicList";
import InteractionView from "@/components/Interaction";
import { InteractionItemResponse } from "@/types/interaction.types";
import { Colors } from "@/constants/colors";
import { EntityInteractionsViewProps } from "./types";
import { styles } from "./styles";

export default function EntityInteractionsView({
    type,
    id,
    interactions,
    isLoading = false,
    isFetchingNextPage = false,
    hasNextPage = false,
    isRefetching = false,
    error,
    onEndReached,
    onRefresh,
    onLike,
}: EntityInteractionsViewProps) {
    const { t } = useTranslation();

    const renderItem = useCallback(
        ({ item }: { item: InteractionItemResponse }) => (
            <InteractionView data={item} onLike={onLike} />
        ),
        [onLike],
    );

    const renderSeparator = useCallback(() => <View style={styles.separator} />, []);

    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader} testID="entity-interactions-footer-loader">
                <ActivityIndicator size="small" color={Colors.primary} />
            </View>
        );
    }, [isFetchingNextPage]);

    const renderEmpty = useCallback(() => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer} testID="entity-interactions-empty">
                <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={48}
                    color={Colors.textMuted}
                    style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>
                    {t("comments.emptyInteractionsTitle", "Henüz yorum yapılmamış")}
                </Text>
                <Text style={styles.emptySubtitle}>
                    {t("comments.emptyInteractionsSubtitle", "İlk yorumu ve değerlendirmeyi sen yap!")}
                </Text>
            </View>
        );
    }, [isLoading, t]);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && onEndReached) {
            onEndReached();
        }
    }, [hasNextPage, isFetchingNextPage, onEndReached]);

    if (isLoading && interactions.length === 0) {
        return (
            <View style={styles.loadingContainer} testID="entity-interactions-initial-loader">
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (error && interactions.length === 0) {
        return (
            <View style={styles.errorContainer} testID="entity-interactions-error">
                <Text style={styles.errorText}>
                    {t("comments.loadError", "Yorumlar yüklenirken bir hata oluştu.")}
                </Text>
                {onRefresh && (
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={onRefresh}
                        activeOpacity={0.8}
                        testID="entity-interactions-retry-button">
                        <Text style={styles.retryText}>{t("common.retry", "Tekrar Deneyin")}</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container} testID="entity-interactions-view">
            <DynamicList<InteractionItemResponse>
                data={interactions}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id || item.comment?.id || `interaction-${index}`}
                variant="vertical"
                ItemSeparatorComponent={renderSeparator}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                style={styles.listContent}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={Boolean(isRefetching)}
                            onRefresh={onRefresh}
                            tintColor={Colors.primary}
                            colors={[Colors.primary]}
                        />
                    ) : undefined
                }
            />
        </View>
    );
}
