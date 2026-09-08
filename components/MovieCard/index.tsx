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
>({
    layout = "vertical",
    variant = "profile",
    compact = false,
    ...props
}: IMovieCardProps<TMovie, TMovieList>) {
    const { t } = useTranslation();
    const isHorizontal = layout === "horizontal";
    const type = props.type ?? "movie";
    const { onPress, style } = props;

    let displayTitle = "";
    let posterUri: string | null = null;
    let interactions: any = null;
    let subtitle: string | null = null;
    let secondaryInfo: string | null = null;
    let ratingAverage: number | undefined = undefined;

    if (type === "movie-list") {
        const listProps = props as Extract<IMovieCardProps, { type: "movie-list" }>;
        const listData = (listProps.data || {}) as any;

        displayTitle = listData.listTitle || listData.title || listProps.title || "";
        posterUri =
            (typeof listData.image === "string" ? listData.image : listData.image?.toString()) ||
            listData.previewMovies?.[0]?.poster ||
            listProps.poster ||
            null;

        const creatorUsername = listData.creator?.username || listData.owners?.[0]?.username;
        subtitle = listProps.hideCreator || !creatorUsername ? null : `@${creatorUsername}`;

        const movieCount = listData.movieCount ?? (listData.previewMovies ? listData.previewMovies.length : undefined);
        secondaryInfo = !compact && movieCount !== undefined ? `${movieCount} ${t("common.movie")}` : null;
        interactions = listProps.interactions;
    } else {
        const movieProps = props as Extract<IMovieCardProps, { type?: "movie" }>;
        const movieData = (movieProps.data || {}) as any;

        const rawTitle = movieData.title || movieProps.title || "";
        const releaseDate = movieData.releaseDate || movieProps.releaseDate;
        const genres = movieData.genres || movieProps.genres;
        ratingAverage = movieData.ratingAverage ?? movieProps.ratingAverage;

        const formatReleaseYear = (dateStr?: string): string => {
            if (!dateStr) return "";
            return dateStr.slice(0, 4);
        };

        displayTitle = [rawTitle, formatReleaseYear(releaseDate)].filter(Boolean).join(" • ");
        posterUri = movieData.poster || movieProps.poster || null;

        subtitle = genres?.filter(Boolean).join(", ") ?? null;
        interactions =
            movieProps.interactions ||
            (movieData.interactions
                ? movieData.interactions
                : movieData.rating !== undefined || movieData.isLiked !== undefined || movieData.hasReview !== undefined
                  ? {
                        rating: movieData.rating,
                        isLiked: movieData.isLiked,
                        hasReview: movieData.hasReview,
                    }
                  : null);
    }

    const formatRating = (rating?: number | string | null): string => {
        if (rating === undefined || rating === null) return "";
        const num = typeof rating === "string" ? parseFloat(rating) : rating;
        if (isNaN(num) || num === 0) return "";
        return num.toFixed(1);
    };

    const fullSubtitle =
        type === "movie-list" ? [subtitle, secondaryInfo].filter(Boolean).join(" • ") : subtitle;

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
                {posterUri ? (
                    <Image source={{ uri: posterUri }} style={styles.poster} accessibilityLabel={displayTitle} />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="film-outline" size={32} color={Colors.textMuted} />
                    </View>
                )}
                {interactions && (
                    <MovieCardFooter
                        interactions={{ ...interactions, rating: Number(formatRating(interactions.rating)) }}
                        variant={variant}
                    />
                )}
            </View>
            <View style={[styles.infoWrapper, !isHorizontal && { flex: 0, width: "100%" }]}>
                <Text
                    style={[
                        styles.title,
                        isHorizontal && styles.horizontalTitle,
                        compact && styles.compactTitle,
                    ]}
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

