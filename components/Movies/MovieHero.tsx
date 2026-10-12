import { useState, useEffect } from "react";
import { Alert, Text, View } from "react-native";
import { styles } from "./styles";
import Badge from "../Badge";
import { Entypo, Ionicons } from "@expo/vector-icons";
import ActionButton from "./ActionButton";
import { MovieHeroProps } from "./types";
import { useWatched } from "@/hooks/movie/useWatched";
import { useLike } from "@/hooks/movie/useLike";
import AddToListBottomSheet from "./AddToListBottomSheet";
import InteractionSheet from "../Interaction/InteractionSheet";
import WatchedMovieBottomSheet from "./WatchedMovieBottomSheet";
import WatchedToast from "./WatchedToast";
import { MovieService } from "@/services/movie.service";
import { MovieId, WatchedMovieId } from "@/types/common.types";
import { useTranslation } from "react-i18next";
import { WatchedMovie } from "@/types/movie.types";
import DetailHero from "@/components/DetailHero";

const formatReleaseYear = (releaseDate?: string | Date) => {
    if (!releaseDate) return "";
    const date = typeof releaseDate === "string" ? new Date(releaseDate) : releaseDate;
    return Number.isNaN(date.getTime()) ? "" : `(${date.getFullYear()})`;
};

export default function MovieHero({
    movie,
    isLoading,
    error,
    isInteractionSheetOpen: externalSheetOpen,
    onInteractionSheetOpenChange,
    isWatched: propIsWatched,
    setIsWatched,
    onShowWatchedToast,
    onOpenWatchedSheet,
}: MovieHeroProps) {
    const { t } = useTranslation();
    const releaseYear = formatReleaseYear(movie?.releaseDate);
    const durationText = movie?.duration ? `${movie.duration} dk` : "";
    const genreText = movie?.genres?.join(", ") ?? "";
    const interactionsCount = movie?.interactions?.length ?? 0;
    const hasCurrentUserInteraction =
        !!movie?.currentUserInteraction?.rating || !!movie?.currentUserInteraction?.isLiked;

    const { markAsWatched, unmarkAsWatched, deleteWatchedEntry, isLoading: isWatchedLoading } = useWatched(movie?.id);
    const isWatched = propIsWatched ?? false;

    const { likeMovie, unlikeMovie, isLoading: isLikeLoading } = useLike(movie?.id);
    const [isLiked, setIsLiked] = useState<boolean>(movie?.currentUserInteraction?.isLiked ?? false);
    const [likesCount, setLikesCount] = useState<number>(movie?.likesCount ?? 0);

    const [isAddToListOpen, setIsAddToListOpen] = useState<boolean>(false);
    const [internalSheetOpen, setInternalSheetOpen] = useState<boolean>(false);
    const isInteractionSheetOpen = externalSheetOpen ?? internalSheetOpen;
    const setIsInteractionSheetOpen = onInteractionSheetOpenChange ?? setInternalSheetOpen;

    const [isInList, setIsInList] = useState<boolean>(movie?.isInList ?? false);
    const [isWatchlisted, setIsWatchlisted] = useState<boolean>(movie?.isWatchlisted ?? false);
    const [userRating, setUserRating] = useState<number>(movie?.currentUserInteraction?.rating ?? 0);
    const [userComment, setUserComment] = useState<string>(
        movie?.currentUserInteraction?.comment?.content ||
            (movie?.currentUserInteraction as any)?.review?.content ||
            "",
    );

    const [commentsCount, setCommentsCount] = useState<number>(
        movie?.commentsCount ?? movie?.interactions?.length ?? 0,
    );

    useEffect(() => {
        const count = movie?.commentsCount ?? movie?.interactions?.length;
        if (count !== undefined) {
            setCommentsCount(count);
        }
    }, [movie?.commentsCount, movie?.interactions?.length]);

    useEffect(() => {
        if (movie?.isInList !== undefined) {
            setIsInList(movie.isInList);
        }
    }, [movie?.isInList]);

    useEffect(() => {
        if (movie?.isWatchlisted !== undefined) {
            setIsWatchlisted(movie.isWatchlisted);
        }
    }, [movie?.isWatchlisted]);

    useEffect(() => {
        if (movie?.currentUserInteraction?.isLiked !== undefined) {
            setIsLiked(movie.currentUserInteraction.isLiked);
        }
    }, [movie?.currentUserInteraction?.isLiked]);

    useEffect(() => {
        if (movie?.currentUserInteraction?.rating !== undefined) {
            setUserRating(movie.currentUserInteraction.rating);
        }
    }, [movie?.currentUserInteraction?.rating]);

    useEffect(() => {
        const commentContent =
            movie?.currentUserInteraction?.comment?.content || (movie?.currentUserInteraction as any)?.review?.content;
        if (commentContent !== undefined) {
            setUserComment(commentContent);
        }
    }, [movie?.currentUserInteraction?.comment?.content, (movie?.currentUserInteraction as any)?.review?.content]);

    useEffect(() => {
        if (movie?.likesCount !== undefined) {
            setLikesCount(movie.likesCount);
        }
    }, [movie?.likesCount]);

    /**
     * İzlendi butonuna basıldığında:
     * - Daha önce izlemediyse: anında kaydeder, toast gösterir
     * - Daha önce izlediyse: bottom sheet açar (sheet kendisi veriyi çeker)
     */
    const handleWatchedToggle = async () => {
        if (!movie?.id) return;

        if (isWatched) {
            onOpenWatchedSheet?.();
        } else {
            // Anında izlendi olarak kaydet (bugünün tarihi)
            try {
                const isoDate = new Date().toISOString();
                const response = await markAsWatched(movie.id, undefined, isoDate);
                if (response?.data) {
                    setIsWatched?.(true);
                    onShowWatchedToast?.(response.data as WatchedMovie);
                }
            } catch (e) {
                // hook içinde yönetiliyor
            }
        }
    };

    const handleLikeToggle = () => {
        if (!movie?.id) return;

        if (isLiked) {
            unlikeMovie(movie.id, () => {
                setIsLiked(false);
                setLikesCount((prev) => Math.max(0, prev - 1));
            });
        } else {
            likeMovie(movie.id, () => {
                setIsLiked(true);
                setLikesCount((prev) => prev + 1);
            });
        }
    };

    return (
        <>
            <DetailHero
                bannerImageUri={movie?.poster}
                cover={
                    <DetailHero.Cover
                        imageUri={movie?.poster}
                        placeholderIcon="film-outline"
                        aspectRatio={2 / 3}
                    />
                }
                title={movie?.title ?? t("movies.detail.loadingText")}
                titleRight={releaseYear}
                subtitle={
                    <View style={styles.metaWrapper}>
                        {durationText ? <Text style={styles.duration}>{durationText}</Text> : null}
                        {durationText && genreText ? <Text style={styles.dot}>•</Text> : null}
                        {genreText ? (
                            <Text style={styles.genres} numberOfLines={1} ellipsizeMode="tail">
                                {genreText}
                            </Text>
                        ) : null}
                    </View>
                }
                stats={
                    <>
                        {typeof movie?.rating === "number" && movie.rating > 0 ? (
                            <Badge icon={<Ionicons name="star" size={12} color="#FF8000" />} value={movie.rating} />
                        ) : null}
                        {typeof likesCount === "number" ? (
                            <Badge icon={<Ionicons name="heart" size={12} color="#FF8000" />} value={likesCount} />
                        ) : null}
                        {typeof commentsCount === "number" ? (
                            <Badge icon={<Entypo name="text" size={12} color="#FF8000" />} value={commentsCount} />
                        ) : null}
                    </>
                }
                actions={
                    <>
                        <ActionButton
                            icon="checkmark"
                            isActive={isWatched}
                            activeColor="#1DB954"
                            onPress={handleWatchedToggle}
                            isLoading={isWatchedLoading}
                        />
                        <ActionButton
                            icon="add"
                            isActive={isInList}
                            activeColor="#38BDF8"
                            onPress={() => setIsAddToListOpen(true)}
                        />
                        <ActionButton
                            icon="heart"
                            isActive={isLiked}
                            activeColor="#FF3B30"
                            onPress={handleLikeToggle}
                            isLoading={isLikeLoading}
                        />
                        <ActionButton
                            icon="star"
                            isActive={
                                userRating > 0 || (typeof userComment === "string" && userComment.trim().length > 0)
                            }
                            activeColor="#FFCC00"
                            onPress={() => setIsInteractionSheetOpen(true)}
                        />
                    </>
                }
            />

            <AddToListBottomSheet
                isVisible={isAddToListOpen}
                onClose={() => setIsAddToListOpen(false)}
                movieId={movie?.id}
                isWatchlisted={isWatchlisted}
                onStatusChange={({ isWatchlisted: updatedWatchlisted, isInList: updatedInList }) => {
                    setIsWatchlisted(updatedWatchlisted);
                    setIsInList(updatedInList);
                }}
            />

            <InteractionSheet
                isVisible={isInteractionSheetOpen}
                onClose={() => setIsInteractionSheetOpen(false)}
                targetType="movie"
                targetId={movie?.id as MovieId}
                mediaTitle={movie?.title ?? ""}
                mediaTypeTitle={t("common.movie")}
                mediaPoster={movie?.poster}
                initialRating={userRating}
                initialComment={userComment}
                initialIsLiked={isLiked}
                onSubmit={async ({ rating, comment, isLiked: updatedIsLiked }) => {
                    if (!movie?.id) return;

                    const hadExistingComment = typeof userComment === "string" && userComment.trim().length > 0;
                    const hasNewComment = typeof comment === "string" && comment.trim().length > 0;

                    if (hasNewComment && !hadExistingComment) {
                        setCommentsCount((prev) => prev + 1);
                    } else if (!hasNewComment && hadExistingComment) {
                        setCommentsCount((prev) => Math.max(0, prev - 1));
                    }

                    await MovieService.createOrUpdateInteraction({
                        targetId: movie.id,
                        interaction: {
                            rating,
                            comment,
                            isLiked: updatedIsLiked,
                        },
                    });

                    setUserRating(rating ?? 0);
                    setUserComment(comment ?? "");

                    if (updatedIsLiked !== isLiked) {
                        setIsLiked(updatedIsLiked ?? false);
                        if (updatedIsLiked) {
                            setLikesCount((prev) => prev + 1);
                        } else {
                            setLikesCount((prev) => Math.max(0, prev - 1));
                        }
                    }
                }}
            />
        </>
    );
}
