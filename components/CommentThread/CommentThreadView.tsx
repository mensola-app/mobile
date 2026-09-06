import React, { useCallback } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import DynamicList from "@/components/DynamicList";
import { Colors } from "@/constants/colors";
import HeroHeader from "./HeroHeader";
import ThreadCommentCard from "./ThreadCommentCard";
import ReplyInputBar from "./ReplyInputBar";
import { threadStyles as styles } from "./styles";
import { CommentThreadViewProps, LocalCommentItem } from "./types";

export default function CommentThreadView({
    mediaPoster,
    mediaTitle,
    mediaType,
    thread,
}: CommentThreadViewProps) {
    const { t } = useTranslation();

    const {
        loading,
        loadingMore,
        isRefetching,
        isError,
        replies,
        allComments,
        rootCommentId,
        displayInteraction,
        heroLike,
        toggleLike,
        handleHeroLike,
        isLikePending,
        addReply,
        isSending,
        replyTarget,
        setReplyTarget,
        cancelReply,
        inputText,
        setInputText,
        onEndReached,
        refetch,
    } = thread;

    const renderItem = useCallback(
        ({ item }: { item: LocalCommentItem }) => (
            <ThreadCommentCard
                item={item}
                allComments={allComments}
                rootCommentId={rootCommentId}
                onReply={setReplyTarget}
                onToggleLike={toggleLike}
                isLikeLoading={isLikePending}
            />
        ),
        [allComments, rootCommentId, setReplyTarget, toggleLike, isLikePending],
    );

    const renderSeparator = useCallback(() => <View style={styles.separator} />, []);

    const renderFooter = useCallback(() => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
            </View>
        );
    }, [loadingMore]);

    const renderEmpty = useCallback(
        () =>
            !loading ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={44} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>
                        {t("comments.emptyTitle", "Henüz yanıt yok")}
                    </Text>
                    <Text style={styles.emptySubtext}>
                        {t("comments.emptySubtitle", "Bu tartışmaya ilk katkıyı sen yap.")}
                    </Text>
                </View>
            ) : null,
        [loading, t],
    );

    return (
        <View style={styles.screen}>
            {/* Loading state */}
            {loading && !allComments.length ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : isError && !allComments.length ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
                    <Text style={styles.errorText}>
                        {t("comments.loadError", "Yorumlar yüklenirken bir hata oluştu.")}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => refetch()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.retryText}>{t("common.retry", "Tekrar Deneyin")}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <DynamicList<LocalCommentItem>
                    data={replies}
                    keyExtractor={(item) => item.id as string}
                    renderItem={renderItem}
                    variant="vertical"
                    ItemSeparatorComponent={renderSeparator}
                    ListHeaderComponent={
                        displayInteraction ? (
                            <HeroHeader
                                mediaPoster={mediaPoster}
                                mediaTitle={mediaTitle}
                                mediaType={mediaType}
                                interaction={displayInteraction}
                                likeCount={heroLike.likeCount}
                                isLiked={heroLike.isLiked}
                                onLike={handleHeroLike}
                            />
                        ) : null
                    }
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.5}
                    onRefresh={refetch}
                    refreshing={isRefetching}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Fixed bottom reply bar */}
            <ReplyInputBar
                value={inputText}
                onChangeText={setInputText}
                onSend={() => addReply()}
                onCancelReply={cancelReply}
                replyTarget={replyTarget}
                isSending={isSending}
            />
        </View>
    );
}
