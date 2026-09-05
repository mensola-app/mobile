import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import DynamicList from "@/components/DynamicList";
import { CommentService } from "@/services/comment.service";
import { Colors } from "@/constants/colors";
import { CommentId } from "@/types/common.types";
import { CommentThreadItem, InteractionItemResponse } from "@/types/interaction.types";
import { CommentDetailParams, LocalCommentItem, ReplyTarget } from "@/components/CommentThread/types";
import { threadStyles as styles } from "@/components/CommentThread/styles";
import ThreadCommentCard from "@/components/CommentThread/ThreadCommentCard";
import ReplyInputBar from "@/components/CommentThread/ReplyInputBar";
import HeroHeader from "@/components/CommentThread/HeroHeader";

const LIMIT = 20;

export default function CommentDetailScreen() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const params = useLocalSearchParams<CommentDetailParams>();

    const commentId = params.commentId as CommentId;

    // Parse serialised interaction from navigation params
    const interactionData: InteractionItemResponse | null = (() => {
        try {
            return params.interactionData ? JSON.parse(params.interactionData) : null;
        } catch {
            return null;
        }
    })();

    // ─── Local UI state ───────────────────────────────────────────────────────
    const [replyTarget, setReplyTarget] = useState<ReplyTarget>(null);
    const [inputText, setInputText] = useState("");
    /** Optimistic like overrides: commentId → { isLikedByMe, likeCount } */
    const [likeOverrides, setLikeOverrides] = useState<
        Record<string, { isLikedByMe: boolean; likeCount: number }>
    >({});
    const [heroLikeOverride, setHeroLikeOverride] = useState<{
        isLikedByMe: boolean;
        likeCount: number;
    } | null>(null);

    // ─── Data fetching ────────────────────────────────────────────────────────
    const queryKey = ["commentThread", commentId];

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useInfiniteQuery({
        queryKey,
        queryFn: ({ pageParam = 1 }) =>
            CommentService.getCommentThread(commentId, pageParam as number, LIMIT),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination;
            if (pagination?.hasMore) return pagination.page + 1;
            return undefined;
        },
    });

    const allComments: CommentThreadItem[] = (data?.pages ?? []).flatMap(
        (page) => page?.data?.comments ?? [],
    );

    /** Root comment id: first parentId-less item in the list */
    const rootCommentId =
        allComments.find((c) => c.parentId === null)?.id ?? commentId;

    // ─── Toggle like mutation ─────────────────────────────────────────────────
    const { mutate: toggleLike, isPending: isLikePending } = useMutation({
        mutationFn: (cid: string) =>
            CommentService.toggleCommentLike(cid as CommentId),
        onMutate: (cid) => {
            // Optimistic update
            const current = likeOverrides[cid] ?? {
                isLikedByMe: allComments.find((c) => (c.id as string) === cid)?.isLikedByMe ?? false,
                likeCount: allComments.find((c) => (c.id as string) === cid)?.likeCount ?? 0,
            };
            setLikeOverrides((prev) => ({
                ...prev,
                [cid]: {
                    isLikedByMe: !current.isLikedByMe,
                    likeCount: current.likeCount + (current.isLikedByMe ? -1 : 1),
                },
            }));
        },
        onSuccess: (result, cid) => {
            if (result?.data) {
                setLikeOverrides((prev) => ({
                    ...prev,
                    [cid]: {
                        isLikedByMe: result.data!.isLikedByMe,
                        likeCount: result.data!.likeCount,
                    },
                }));
            }
        },
        onError: (_err, cid) => {
            // Roll back optimistic update
            setLikeOverrides((prev) => {
                const next = { ...prev };
                delete next[cid];
                return next;
            });
        },
    });

    const handleToggleLike = useCallback(
        (cid: string) => {
            if (isLikePending) return;
            toggleLike(cid);
        },
        [isLikePending, toggleLike],
    );

    const handleHeroLike = useCallback(() => {
        if (!interactionData?.comment?.id) return;
        const cid = interactionData.comment.id as string;
        const current = heroLikeOverride ?? {
            isLikedByMe: false,
            likeCount: 0,
        };
        // Optimistic
        setHeroLikeOverride({
            isLikedByMe: !current.isLikedByMe,
            likeCount: current.likeCount + (current.isLikedByMe ? -1 : 1),
        });
        CommentService.toggleCommentLike(cid as CommentId)
            .then((res) => {
                if (res?.data) {
                    setHeroLikeOverride({
                        isLikedByMe: res.data.isLikedByMe,
                        likeCount: res.data.likeCount,
                    });
                }
            })
            .catch(() => setHeroLikeOverride(current));
    }, [interactionData, heroLikeOverride]);

    // ─── Reply / Send ─────────────────────────────────────────────────────────
    const handleSend = useCallback(async () => {
        if (!inputText.trim()) return;
        // TODO: wire up POST /comments/:id/reply endpoint when added
        setInputText("");
        setReplyTarget(null);
        // Invalidate to refresh list
        queryClient.invalidateQueries({ queryKey });
    }, [inputText, replyTarget, queryClient, queryKey]);

    const handleCancelReply = useCallback(() => setReplyTarget(null), []);

    // ─── Pagination & DynamicList helpers ─────────────────────────────────────
    const handleLoadMore = useCallback(() => {
        if (!isFetchingNextPage && hasNextPage) {
            fetchNextPage();
        }
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    const renderItem = useCallback(
        ({ item }: { item: CommentThreadItem }) => {
            const override = likeOverrides[item.id as string];
            const localItem: LocalCommentItem = {
                ...item,
                _localIsLikedByMe: override?.isLikedByMe,
                _localLikeCount: override?.likeCount,
            };
            return (
                <ThreadCommentCard
                    item={localItem}
                    allComments={allComments}
                    rootCommentId={rootCommentId as string}
                    onReply={setReplyTarget}
                    onToggleLike={handleToggleLike}
                    isLikeLoading={isLikePending}
                />
            );
        },
        [likeOverrides, allComments, rootCommentId, handleToggleLike, isLikePending],
    );

    const renderSeparator = useCallback(() => <View style={styles.separator} />, []);

    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
            </View>
        );
    }, [isFetchingNextPage]);

    const renderEmpty = useCallback(
        () =>
            !isLoading ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={44} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>{t("comments.emptyTitle", "Henüz yanıt yok")}</Text>
                    <Text style={styles.emptySubtext}>
                        {t("comments.emptySubtitle", "Bu tartışmaya ilk katkıyı sen yap.")}
                    </Text>
                </View>
            ) : null,
        [isLoading, t],
    );

    return (
        <SafeAreaView style={styles.screen} edges={["bottom"]}>
            <Stack.Screen options={{ title: t("comments.threadTitle", "Tartışma") }} />

            {/* Loading state */}
            {isLoading && !data ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : isError && !allComments.length ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
                    <Text style={styles.errorText}>
                        {t("comments.loadError", "Yorumlar yüklenirken bir hata oluştu.")}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => refetch()} activeOpacity={0.8}>
                        <Text style={styles.retryText}>{t("common.retry", "Tekrar Deneyin")}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <DynamicList<CommentThreadItem>
                    data={allComments}
                    keyExtractor={(item) => item.id as string}
                    renderItem={renderItem}
                    variant="vertical"
                    ItemSeparatorComponent={renderSeparator}
                    ListHeaderComponent={
                        interactionData ? (
                            <HeroHeader
                                mediaPoster={params.mediaPoster}
                                mediaTitle={params.mediaTitle}
                                mediaType={params.mediaType}
                                interaction={interactionData}
                                likeCount={heroLikeOverride?.likeCount}
                                isLikedByMe={heroLikeOverride?.isLikedByMe}
                                onLike={handleHeroLike}
                            />
                        ) : null
                    }
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleLoadMore}
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
                onSend={handleSend}
                onCancelReply={handleCancelReply}
                replyTarget={replyTarget}
                isSending={false}
            />
        </SafeAreaView>
    );
}
