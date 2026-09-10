import React from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import { styles } from "./styles";
import { IMovieCardProps } from "./types";
import MovieCardFooter from "./MovieCardFooter";
import Badge from "../Badge";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";
import { IMovie, IMovieList } from "@/types/movie.types";

export default function MovieCard<
    TMovie extends Omit<IMovie, "id"> = Omit<IMovie, "id">,
    TMovieList extends Omit<IMovieList, "id"> = Omit<IMovieList, "id">,
>({ layout = "vertical", variant = "profile", compact = false, ...props }: IMovieCardProps<TMovie, TMovieList>) {
    const { t } = useTranslation();
    const isHorizontal = layout === "horizontal";
    const type = props.type ?? "movie";
    const { onPress, style } = props;

    let displayTitle = "";
    let coverContent: React.ReactNode = null;
    let interactions: any = null;
    let subtitle: string | null = null;
    let secondaryInfo: string | null = null;
    let ratingAverage: number | undefined = undefined;
    let watchCount: number | undefined = undefined;

    if (type === "movie-list") {
        const listProps = props as Extract<IMovieCardProps, { type: "movie-list" }>;
        const listData = (listProps.data || {}) as any;

        displayTitle = listData.listTitle || listData.title || listProps.title || "";
        const rawCoverImage =
            (typeof listData.image === "string" ? listData.image : listData.image?.toString()) ||
            listProps.poster ||
            null;

        const moviePosters: string[] = (
            (Array.isArray(listData.previewImages) && listData.previewImages.length > 0
                ? listData.previewImages
                : null) ||
            listData.previewMovies?.map((m: any) => m.poster).filter(Boolean) ||
            listData.movies?.map((m: any) => m.poster).filter(Boolean) ||
            []
        ).filter(Boolean);

        const creatorUsername = listData.creator?.username || listData.owners?.[0]?.username;
        subtitle = listProps.hideCreator || !creatorUsername ? null : `@${creatorUsername}`;

        const movieCount =
            listData.movieCount ??
            (listData.previewImages ? listData.previewImages.length : undefined) ??
            (listData.previewMovies ? listData.previewMovies.length : undefined) ??
            (listData.movies ? listData.movies.length : undefined);
        secondaryInfo = movieCount !== undefined && movieCount !== null ? `${movieCount} ${t("common.movie")}` : null;
        interactions = listProps.interactions;

        if (rawCoverImage) {
            coverContent = (
                <Image source={{ uri: rawCoverImage }} style={styles.poster} accessibilityLabel={displayTitle} />
            );
        } else if (moviePosters.length === 0) {
            coverContent = (
                <View style={styles.placeholderContainer}>
                    <Ionicons name="film-outline" size={32} color={Colors.textMuted} />
                </View>
            );
        } else if (moviePosters.length < 4) {
            coverContent = (
                <Image source={{ uri: moviePosters[0] }} style={styles.poster} accessibilityLabel={displayTitle} />
            );
        } else {
            coverContent = (
                <View style={styles.gridContainer}>
                    {moviePosters.slice(0, 4).map((posterUri, idx) => (
                        <Image key={idx} source={{ uri: posterUri }} style={styles.gridImage} resizeMode="cover" />
                    ))}
                </View>
            );
        }
    } else {
        const movieProps = props as Extract<IMovieCardProps, { type?: "movie" }>;
        const movieData = (movieProps.data || {}) as any;

        const rawTitle = movieData.title || movieProps.title || "";
        const releaseDate = movieData.releaseDate || movieProps.releaseDate;
        const genres = movieData.genres || movieProps.genres;
        ratingAverage = movieData.ratingAverage ?? movieProps.ratingAverage;
        watchCount = movieData.watchCount ?? (movieProps as any).watchCount;

        const formatReleaseYear = (dateStr?: string): string => {
            if (!dateStr) return "";
            return dateStr.slice(0, 4);
        };

        displayTitle = [rawTitle, formatReleaseYear(releaseDate)].filter(Boolean).join(" • ");
        const posterUri = movieData.poster || movieProps.poster || null;

        subtitle = genres?.filter(Boolean).join(", ") ?? null;
        interactions =
            movieProps.interactions ||
            (movieData.interactions
                ? { ...movieData.interactions, watchCount }
                : movieData.rating !== undefined ||
                    movieData.isLiked !== undefined ||
                    movieData.hasReview !== undefined ||
                    watchCount !== undefined
                  ? {
                        rating: movieData.rating,
                        isLiked: movieData.isLiked,
                        hasReview: movieData.hasReview,
                        watchCount,
                    }
                  : null);

        if (posterUri) {
            coverContent = (
                <Image source={{ uri: posterUri }} style={styles.poster} accessibilityLabel={displayTitle} />
            );
        } else {
            coverContent = (
                <View style={styles.placeholderContainer}>
                    <Ionicons name="film-outline" size={32} color={Colors.textMuted} />
                </View>
            );
        }
    }

    const formatRating = (rating?: number | string | null): string => {
        if (rating === undefined || rating === null) return "";
        const num = typeof rating === "string" ? parseFloat(rating) : rating;
        if (isNaN(num) || num === 0) return "";
        return num.toFixed(1);
    };

    const fullSubtitle = type === "movie-list" ? [subtitle, secondaryInfo].filter(Boolean).join(" • ") : subtitle;

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
                {interactions && (
                    <MovieCardFooter
                        interactions={{ ...interactions, rating: Number(formatRating(interactions.rating)) }}
                        variant={variant}
                    />
                )}
                {type === "movie" && watchCount !== undefined && watchCount > 1 && (
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
                {type === "movie" && isHorizontal && !!ratingAverage && ratingAverage !== 0 && (
                    <Badge
                        icon={<Ionicons name="star" size={10} color="#FF8000" />}
                        value={formatRating(ratingAverage)}
                        style={styles.badgeItem}
                        textStyle={styles.badgeText}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
}
