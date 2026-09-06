import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useGlobalUser } from "@/context/AuthContext";
import { CommentService } from "@/services/comment.service";
import { CommentId } from "@/types/common.types";
import {
    CommentThreadItem,
    InteractionItemResponse,
} from "@/types/interaction.types";
import { LocalCommentItem, ReplyTarget } from "@/components/CommentThread/types";

export interface UseCommentDetailOptions {
    limit?: number;
}

export interface UseCommentDetailReturn {
    // Pagination & Loading state
    page: number;
    limit: number;
    hasMore: boolean;
    loading: boolean;
    loadingMore: boolean;
    isRefetching: boolean;
    isError: boolean;
    error: unknown;
    fetchFirstPage: () => Promise<unknown>;
    fetchNextPage: () => void;
    fetchMore: () => void;
    onEndReached: () => void;
    refetch: () => Promise<unknown>;

    // Thread data
    allComments: CommentThreadItem[];
    rootComment: CommentThreadItem | undefined;
    rootCommentId: string;
    replies: LocalCommentItem[];
    displayInteraction: InteractionItemResponse | null;
    heroLike: { isLiked: boolean; likeCount: number };
    likeOverrides: Record<string, { isLiked: boolean; likeCount: number }>;

    // Actions & Local State
    toggleLike: (cid?: string) => void;
    handleHeroLike: () => void;
    isLikePending: boolean;
    addReply: (content?: string, targetCommentId?: CommentId) => Promise<boolean>;
    isSending: boolean;
    replyTarget: ReplyTarget;
    setReplyTarget: React.Dispatch<React.SetStateAction<ReplyTarget>>;
    cancelReply: () => void;
    inputText: string;
    setInputText: (text: string) => void;
}

export const useCommentDetail = (
    commentId: CommentId,
    initialInteractionData?: InteractionItemResponse | null,
    options?: UseCommentDetailOptions,
): UseCommentDetailReturn => {
    const { t } = useTranslation();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, token } = useGlobalUser();

    const limit = options?.limit ?? 20;

    // ─── Local UI State ────────────────────────────────────────────────────────
    const [replyTarget, setReplyTarget] = useState<ReplyTarget>(null);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);

    /** Optimistic like overrides: commentId → { isLiked, likeCount } */
    const [likeOverrides, setLikeOverrides] = useState<
        Record<string, { isLiked: boolean; likeCount: number }>
    >({});
    const [heroLikeOverride, setHeroLikeOverride] = useState<{
        isLiked: boolean;
        likeCount: number;
    } | null>(null);

    // ─── Paginated Data Fetching ───────────────────────────────────────────────
    const queryKey = useMemo(() => ["commentThread", commentId], [commentId]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
    } = useInfiniteQuery({
        queryKey,
        queryFn: ({ pageParam = 1 }) =>
            CommentService.getCommentThread(commentId, pageParam as number, limit),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination;
            if (pagination?.hasMore) return pagination.page + 1;
            return undefined;
        },
    });

    const currentPage =
        data?.pages?.[data.pages.length - 1]?.data?.pagination?.page ?? 1;

    // ─── Comments Derivation ───────────────────────────────────────────────────
    const allComments: CommentThreadItem[] = useMemo(
        () => (data?.pages ?? []).flatMap((page) => page?.data?.comments ?? []),
        [data?.pages],
    );

    /**
     * Root comment: the main discussion-starter comment.
     * Detected either by matching route commentId or parentId === null.
     */
    const rootComment = useMemo(
        () =>
            allComments.find(
                (c) =>
                    (c.id as string) === (commentId as string) ||
                    c.parentId === null,
            ),
        [allComments, commentId],
    );

    const rootCommentId = (rootComment?.id ?? commentId) as string;

    /**
     * Filtered replies for the list (DynamicList):
     * Excludes root comment so it is NOT rendered twice.
     * Injects optimistic like states into each item.
     */
    const replies: LocalCommentItem[] = useMemo(() => {
        return allComments
            .filter(
                (c) =>
                    (c.id as string) !== (rootCommentId as string) &&
                    (c.id as string) !== (commentId as string) &&
                    c.parentId !== null,
            )
            .map((item) => {
                const override = likeOverrides[item.id as string];
                return {
                    ...item,
                    _localIsLiked:
                        override !== undefined ? override.isLiked : item.isLiked,
                    _localLikeCount:
                        override !== undefined ? override.likeCount : item.likeCount,
                };
            });
    }, [allComments, rootCommentId, commentId, likeOverrides]);

    /**
     * Display interaction for HeroHeader:
     * Prefers navigation param interactionData, but falls back to synthesized rootComment data.
     */
    const displayInteraction: InteractionItemResponse | null = useMemo(() => {
        if (initialInteractionData) return initialInteractionData;
        if (!rootComment) return null;

        return {
            id: rootComment.id as any,
            rating: 0,
            isLiked: rootComment.isLiked ?? false,
            likesCount: rootComment.likeCount,
            replyCount: replies.length,
            user: {
                id: rootComment.user.id,
                username: rootComment.user.username,
                fullname: rootComment.user.username,
                avatar: rootComment.user.avatar,
            } as any,
            comment: {
                id: rootComment.id,
                content: rootComment.content,
                date: rootComment.createdAt,
            },
        };
    }, [initialInteractionData, rootComment, replies.length]);

    /**
     * Resolved like state for the hero/root comment.
     */
    const heroLike = useMemo(() => {
        const heroId = (rootComment?.id ??
            displayInteraction?.comment?.id ??
            commentId) as string;

        if (likeOverrides[heroId]) {
            return likeOverrides[heroId];
        }
        if (heroLikeOverride) {
            return heroLikeOverride;
        }
        if (rootComment) {
            return {
                isLiked: rootComment.isLiked ?? false,
                likeCount: rootComment.likeCount,
            };
        }
        if (displayInteraction) {
            return {
                isLiked: Boolean(displayInteraction.isLikedByMe),
                likeCount:
                    displayInteraction.likesCount ??
                    displayInteraction.likeCount ??
                    0,
            };
        }
        return { isLiked: false, likeCount: 0 };
    }, [
        rootComment,
        displayInteraction,
        commentId,
        likeOverrides,
        heroLikeOverride,
    ]);

    // ─── Toggle Like Mutation ─────────────────────────────────────────────────
    const { mutate: toggleLikeMutation, isPending: isLikePending } = useMutation({
        mutationFn: (cid: string) =>
            CommentService.toggleCommentLike(cid as CommentId),
        onMutate: (cid) => {
            const previousOverrides = { ...likeOverrides };
            const previousHero = heroLikeOverride;

            const targetComment = allComments.find((c) => (c.id as string) === cid);
            const isHeroTarget =
                cid === (rootCommentId as string) ||
                cid === (commentId as string) ||
                cid === (displayInteraction?.comment?.id as string);

            const currentIsLiked =
                likeOverrides[cid]?.isLiked ??
                targetComment?.isLiked ??
                (isHeroTarget ? Boolean(displayInteraction?.isLikedByMe) : false);

            const currentCount =
                likeOverrides[cid]?.likeCount ??
                targetComment?.likeCount ??
                (isHeroTarget ? (displayInteraction?.likesCount ?? 0) : 0);

            const nextLiked = !currentIsLiked;
            const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));

            // Optimistic update for list item
            setLikeOverrides((prev) => ({
                ...prev,
                [cid]: {
                    isLiked: nextLiked,
                    likeCount: nextCount,
                },
            }));

            // If hero target, update hero override immediately
            if (isHeroTarget) {
                setHeroLikeOverride({
                    isLiked: nextLiked,
                    likeCount: nextCount,
                });
            }

            return { previousOverrides, previousHero };
        },
        onSuccess: (result: any, cid) => {
            const resData = result?.data || result;
            if (resData) {
                const freshLiked =
                    typeof result?.isLiked === "boolean"
                        ? result.isLiked
                        : resData.isLiked;
                const freshCount =
                    typeof result?.likeCount === "number"
                        ? result.likeCount
                        : resData.likeCount;

                setLikeOverrides((prev) => ({
                    ...prev,
                    [cid]: {
                        isLiked: freshLiked,
                        likeCount: freshCount,
                    },
                }));

                const isHeroTarget =
                    cid === (rootCommentId as string) ||
                    cid === (commentId as string) ||
                    cid === (displayInteraction?.comment?.id as string);

                if (isHeroTarget) {
                    setHeroLikeOverride({
                        isLiked: freshLiked,
                        likeCount: freshCount,
                    });
                }
            }
        },
        onError: (err: any, cid, context) => {
            console.error("[toggleLike mutation onError]:", {
                commentId: cid,
                status: err?.status || err?.statusCode,
                data: err?.data || err?.response,
                message: err?.message,
                err,
            });
            // Roll back optimistic state
            if (context?.previousOverrides) {
                setLikeOverrides(context.previousOverrides);
            }
            if (context?.previousHero !== undefined) {
                setHeroLikeOverride(context.previousHero);
            }
            Alert.alert(
                t("common.error", "Hata"),
                t("common.genericError", "Beğeni işlemi gerçekleştirilemedi."),
            );
        },
    });

    const toggleLike = useCallback(
        (cid?: string) => {
            const targetId =
                cid ??
                ((rootComment?.id ??
                    displayInteraction?.comment?.id ??
                    commentId) as string);

            if (!targetId) return;

            if (!token || !user) {
                Alert.alert(
                    t("common.loginRequired", "Giriş Yapmalısınız"),
                    t(
                        "common.loginRequiredMessage",
                        "Beğeni yapmak için lütfen giriş yapın.",
                    ),
                    [
                        { text: t("common.cancel", "İptal"), style: "cancel" },
                        {
                            text: t("common.login", "Giriş Yap"),
                            onPress: () => router.push("/(auth)/login"),
                        },
                    ],
                );
                return;
            }

            if (isLikePending) return;
            toggleLikeMutation(targetId);
        },
        [
            rootComment,
            displayInteraction,
            commentId,
            token,
            user,
            isLikePending,
            toggleLikeMutation,
            t,
            router,
        ],
    );

    const handleHeroLike = useCallback(() => {
        const heroId = (rootComment?.id ??
            displayInteraction?.comment?.id ??
            commentId) as string | undefined;
        if (heroId) {
            toggleLike(heroId);
        }
    }, [rootComment, displayInteraction, commentId, toggleLike]);

    // ─── Add Reply Mutation / Handler ──────────────────────────────────────────
    const addReply = useCallback(
        async (
            content?: string,
            targetCommentId?: CommentId,
        ): Promise<boolean> => {
            const text = (content !== undefined ? content : inputText).trim();
            if (!text || isSending) return false;

            if (!token || !user) {
                Alert.alert(
                    t("common.loginRequired", "Giriş Yapmalısınız"),
                    t(
                        "common.loginRequiredMessage",
                        "Yanıt yazmak için lütfen giriş yapın.",
                    ),
                    [
                        { text: t("common.cancel", "İptal"), style: "cancel" },
                        {
                            text: t("common.login", "Giriş Yap"),
                            onPress: () => router.push("/(auth)/login"),
                        },
                    ],
                );
                return false;
            }

            const resolvedTargetId =
                targetCommentId ??
                (replyTarget
                    ? replyTarget.commentId
                    : (rootCommentId as CommentId));

            setIsSending(true);
            try {
                await CommentService.createReply(resolvedTargetId, text);
                setInputText("");
                setReplyTarget(null);
                // Invalidate query cache to retrieve the newly added reply and fresh pagination
                await queryClient.invalidateQueries({ queryKey });
                return true;
            } catch (error) {
                console.error("[useCommentDetail.addReply] Error:", error);
                Alert.alert(
                    t("common.error", "Hata"),
                    t(
                        "comments.replyError",
                        "Yanıt gönderilirken bir hata oluştu.",
                    ),
                );
                return false;
            } finally {
                setIsSending(false);
            }
        },
        [
            inputText,
            isSending,
            token,
            user,
            replyTarget,
            rootCommentId,
            queryClient,
            queryKey,
            t,
            router,
        ],
    );

    const cancelReply = useCallback(() => {
        setReplyTarget(null);
    }, []);

    // ─── Pagination Helpers ────────────────────────────────────────────────────
    const fetchMore = useCallback(() => {
        if (!isFetchingNextPage && hasNextPage) {
            fetchNextPage();
        }
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    const fetchFirstPage = useCallback(async () => {
        return await refetch();
    }, [refetch]);

    return {
        // Pagination & Loading
        page: currentPage,
        limit,
        hasMore: Boolean(hasNextPage),
        loading: isLoading,
        loadingMore: isFetchingNextPage,
        isRefetching,
        isError,
        error,
        fetchFirstPage,
        fetchNextPage,
        fetchMore,
        onEndReached: fetchMore,
        refetch,

        // Data
        allComments,
        rootComment,
        rootCommentId,
        replies,
        displayInteraction,
        heroLike,
        likeOverrides,

        // Actions & State
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
    };
};
