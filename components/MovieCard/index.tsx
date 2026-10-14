import React, { useMemo } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Image } from "expo-image";
import { styles } from "./styles";
import { IMovieCardProps, MovieCardListData, MovieCardMovieData } from "./types";
import MovieCardFooter from "./MovieCardFooter";
import Badge from "../Badge";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";
import { IMovie, IMovieList } from "@/types/movie.types";

const formatRating = (rating?: number | string | null): string => {
    if (rating === undefined || rating === null) return "";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    if (isNaN(num) || num === 0) return "";
    return num.toFixed(1);
};

const formatReleaseYear = (dateStr?: string): string => {
    if (!dateStr) return "";
    return dateStr.slice(0, 4);
};

function MovieCardComponent<
    TMovie extends Omit<IMovie, "id"> = Omit<IMovie, "id">,
    TMovieList extends Omit<IMovieList, "id"> = Omit<IMovieList, "id">,
>({ layout = "vertical", variant = "profile", compact = false, ...props }: IMovieCardProps<TMovie, TMovieList>) {
    const { t } = useTranslation();
    const isHorizontal = layout === "horizontal";
    const type = props.type ?? "movie";
    const { onPress, style } = props;

    const {
        displayTitle,
        subtitle,
        secondaryInfo,
        rawCoverImage,
        moviePosters,
        posterUri,
        interactions,
        ratingAverage,
        watchCount,
    } = useMemo(() => {
        if (type === "movie-list") {
            const listProps = props as Extract<IMovieCardProps, { type: "movie-list" }>;
            const listData = (listProps.data || {}) as MovieCardListData;

            const dispTitle = listData.listTitle || listData.title || listProps.title || "";
            const rawCover =
                (listData.image ? String(listData.image) : null) ||
                listProps.poster ||
                null;

            const posters: string[] = (
                (Array.isArray(listData.previewImages) && listData.previewImages.length > 0
                    ? listData.previewImages
                    : null) ||
                listData.previewMovies?.map((m) => m.poster).filter(Boolean) ||
                listData.movies?.map((m) => m.poster).filter(Boolean) ||
                []
            ).filter(Boolean) as string[];

            const creatorUsername = listData.creator?.username || listData.owners?.[0]?.username;
            const sub = listProps.hideCreator || !creatorUsername ? null : `@${creatorUsername}`;

            const movieCount =
                listData.movieCount ??
                (listData.previewImages ? listData.previewImages.length : undefined) ??
                (listData.previewMovies ? listData.previewMovies.length : undefined) ??
                (listData.movies ? listData.movies.length : undefined);
            const secInfo = movieCount !== undefined && movieCount !== null ? `${movieCount} ${t("common.movie")}` : null;

            return {
                displayTitle: dispTitle,
                subtitle: sub,
                secondaryInfo: secInfo,
                rawCoverImage: rawCover,
                moviePosters: posters,
                posterUri: null,
                interactions: listProps.interactions ?? null,
                ratingAverage: undefined,
                watchCount: undefined,
            };
        } else {
            const movieProps = props as Extract<IMovieCardProps, { type?: "movie" }>;
            const movieData = (movieProps.data || {}) as MovieCardMovieData;

            const rawTitle = movieData.title || movieProps.title || "";
            const releaseDate = movieData.releaseDate || movieProps.releaseDate;
            const genres = movieData.genres || movieProps.genres;
            const avgRating = movieData.ratingAverage ?? movieProps.ratingAverage;
            const wCount = movieData.watchCount ?? movieProps.watchCount;

            const dispTitle = [rawTitle, formatReleaseYear(releaseDate)].filter(Boolean).join(" • ");
            const postUri = movieData.poster || movieProps.poster || null;
            const sub = genres?.filter(Boolean).join(", ") ?? null;

            const inter =
                movieProps.interactions ||
                (movieData.interactions
                    ? { ...movieData.interactions, watchCount: wCount }
                    : movieData.rating !== undefined ||
                        movieData.isLiked !== undefined ||
                        movieData.hasReview !== undefined ||
                        wCount !== undefined
                      ? {
                            rating: movieData.rating,
                            isLiked: movieData.isLiked,
                            hasReview: movieData.hasReview,
                            watchCount: wCount,
                        }
                      : null);

            return {
                displayTitle: dispTitle,
                subtitle: sub,
                secondaryInfo: null,
                rawCoverImage: null,
                moviePosters: [],
                posterUri: postUri,
                interactions: inter,
                ratingAverage: avgRating,
                watchCount: wCount,
            };
        }
    }, [props, type, t]);

    const coverContent = useMemo(() => {
        if (type === "movie-list") {
            if (rawCoverImage) {
                return (
                    <Image
                        source={{ uri: rawCoverImage }}
                        style={styles.poster}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={150}
                        accessibilityLabel={displayTitle}
                    />
                );
            }
            if (moviePosters.length === 0) {
                return (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="film-outline" size={32} color={Colors.textMuted} />
                    </View>
                );
            }
            if (moviePosters.length < 4) {
                return (
                    <Image
                        source={{ uri: moviePosters[0] }}
                        style={styles.poster}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={150}
                        accessibilityLabel={displayTitle}
                    />
                );
            }
            return (
                <View style={styles.gridContainer}>
                    {moviePosters.slice(0, 4).map((posterUriItem, idx) => (
                        <Image
                            key={idx}
                            source={{ uri: posterUriItem }}
                            style={styles.gridImage}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={150}
                        />
                    ))}
                </View>
            );
        }

        if (posterUri) {
            return (
                <Image
                    source={{ uri: posterUri }}
                    style={styles.poster}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={150}
                    accessibilityLabel={displayTitle}
                />
            );
        }

        return (
            <View style={styles.placeholderContainer}>
                <Ionicons name="film-outline" size={32} color={Colors.textMuted} />
            </View>
        );
    }, [type, rawCoverImage, moviePosters, displayTitle, posterUri]);

    const fullSubtitle = useMemo(() => {
        return type === "movie-list" ? [subtitle, secondaryInfo].filter(Boolean).join(" • ") : subtitle;
    }, [type, subtitle, secondaryInfo]);

    const isProfile = variant === "profile";
    const ratingValue = interactions?.rating ?? ratingAverage;
    const formattedRating = formatRating(ratingValue);
    const hasRating = !!formattedRating;
    const hasLikes = isProfile ? !!interactions?.isLiked : !!(interactions?.totalLikes && interactions.totalLikes > 0);
    const hasReviews = isProfile ? !!interactions?.hasReview : !!(interactions?.totalReviews && interactions.totalReviews > 0);
    const hasWatchCount = type === "movie" && watchCount !== undefined && watchCount > 1;
    const hasHorizontalBadges = hasRating || hasLikes || hasReviews || hasWatchCount;

    const footerInteractions = useMemo(() => {
        if (!interactions) return null;
        return {
            ...interactions,
            rating: Number(formatRating(interactions.rating)),
        };
    }, [interactions]);

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[isHorizontal ? styles.horizontalContainer : styles.verticalContainer, style]}
            activeOpacity={0.7}>
            <View
                style={[
                    styles.posterContainer,
                    isHorizontal ? styles.horizontalPosterContainer : styles.verticalPosterContainer,
                ]}>
                {coverContent}
                {!isHorizontal && footerInteractions && (
                    <MovieCardFooter
                        interactions={footerInteractions}
                        variant={variant}
                    />
                )}
                {!isHorizontal && type === "movie" && watchCount !== undefined && watchCount > 1 && (
                    <Badge
                        icon={<Ionicons name="eye" size={10} color="#FF8000" />}
                        value={`${watchCount}`}
                        style={[styles.badgeItem, styles.topRightBadge]}
                        textStyle={styles.badgeText}
                    />
                )}
            </View>
            <View style={[styles.infoWrapper, !isHorizontal && { flex: 0, width: "100%" }]}>
                <Text
                    style={[styles.title, isHorizontal && styles.horizontalTitle, compact && styles.compactTitle]}
                    numberOfLines={1}>
                    {displayTitle}
                </Text>
                {type === "movie-list" && fullSubtitle ? (
                    <Text style={[styles.subTitle, compact && styles.compactSubTitle]} numberOfLines={1}>
                        {fullSubtitle}
                    </Text>
                ) : null}
                {type === "movie" && isHorizontal && !!subtitle && (
                    <Text style={styles.genres} numberOfLines={1}>
                        {subtitle}
                    </Text>
                )}
                {isHorizontal && hasHorizontalBadges && (
                    <View style={styles.horizontalBadgeRow}>
                        {hasRating && (
                            <Badge
                                icon={<Ionicons name="star" size={10} color="#FF8000" />}
                                value={formattedRating}
                                style={styles.badgeItem}
                                textStyle={styles.badgeText}
                            />
                        )}
                        {hasLikes && (
                            <Badge
                                icon={<Ionicons name="heart" size={10} color="#FF8000" />}
                                value={!isProfile ? interactions?.totalLikes : undefined}
                                style={styles.badgeItem}
                                textStyle={styles.badgeText}
                            />
                        )}
                        {hasReviews && (
                            <Badge
                                icon={<Entypo name="text" size={10} color="#FF8000" />}
                                value={!isProfile ? interactions?.totalReviews : undefined}
                                style={styles.badgeItem}
                                textStyle={styles.badgeText}
                            />
                        )}
                        {hasWatchCount && (
                            <Badge
                                icon={<Ionicons name="eye" size={10} color="#FF8000" />}
                                value={`${watchCount}`}
                                style={styles.badgeItem}
                                textStyle={styles.badgeText}
                            />
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const MovieCard = React.memo(MovieCardComponent) as typeof MovieCardComponent;
export default MovieCard;
