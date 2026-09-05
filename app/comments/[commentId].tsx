import React, { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    const router = useRouter();
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

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
        useInfiniteQuery({
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
        // For now just clear input and reset reply target
        setInputText("");
        setReplyTarget(null);
        // Invalidate to refresh list
        queryClient.invalidateQueries({ queryKey });
    }, [inputText, replyTarget, queryClient, queryKey]);

    const handleCancelReply = useCallback(() => setReplyTarget(null), []);

    // ─── Render ───────────────────────────────────────────────────────────────
    const renderItem: ListRenderItem<CommentThreadItem> = useCallback(
        ({ item }) => {
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

    const ListSeparator = useCallback(
        () => <View style={styles.separator} />,
        [],
    );

    const ListFooter = useCallback(
        () =>
            isFetchingNextPage ? (
                <View style={styles.footerLoader}>
                    <ActivityIndicator color={Colors.primary} />
                </View>
            ) : null,
        [isFetchingNextPage],
    );

    const ListEmpty = useCallback(
        () =>
            !isLoading ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={40} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>Henüz yanıt yok</Text>
                    <Text style={styles.emptySubtext}>Bu tartışmaya ilk katkıyı sen yap.</Text>
                </View>
            ) : null,
        [isLoading],
    );

    return (
        <SafeAreaView style={styles.screen} edges={["top"]}>
            {/* Back button */}
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 }}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} hitSlop={8}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text
                    style={{ marginLeft: 10, fontSize: 17, fontWeight: "700", color: Colors.textPrimary }}
                    numberOfLines={1}>
                    Tartışma
                </Text>
            </View>

            {/* Loading state */}
            {isLoading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator color={Colors.primary} size="large" />
                </View>
            ) : isError ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={40} color={Colors.danger} />
                    <Text style={styles.emptyText}>Yüklenemedi</Text>
                    <Text style={styles.emptySubtext}>Lütfen tekrar deneyin.</Text>
                </View>
            ) : (
                <FlatList<CommentThreadItem>
                    data={allComments}
                    keyExtractor={(item) => item.id as string}
                    renderItem={renderItem}
                    ItemSeparatorComponent={ListSeparator}
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
                    ListEmptyComponent={ListEmpty}
                    ListFooterComponent={ListFooter}
                    contentContainerStyle={styles.listContent}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                    }}
                    onEndReachedThreshold={0.3}
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
