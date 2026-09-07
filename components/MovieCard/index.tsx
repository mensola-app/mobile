import { TouchableOpacity, Image, View, Text } from "react-native";

import { styles } from "./styles";
import { IMovieCardProps } from "./types";

import MovieCardFooter from "./MovieCardFooter";
import Badge from "../Badge";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

export default function MovieCard({
    title,
    poster,
    interactions,
    variant = "profile",
    layout = "vertical",
    style,
    onPress,
    releaseDate,
    genres,
    ratingAverage,
}: IMovieCardProps) {
    const isHorizontal = layout === "horizontal";

    const formatReleaseYear = (dateStr?: string): string => {
        if (!dateStr) return "";
        return dateStr.slice(0, 4);
    };

    const formatRating = (rating?: number | string | null): string => {
        if (rating === undefined || rating === null) return "";

        const num = typeof rating === "string" ? parseFloat(rating) : rating;

        if (isNaN(num) || num === 0) return "";

        return num.toFixed(1);
    };

    const mainTitle = [title, formatReleaseYear(releaseDate)].filter(Boolean).join(" • ");
    const subtitle = genres?.filter(Boolean).join(", ");

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
                <Image source={{ uri: poster }} style={styles.poster} accessibilityLabel={title} />
                {interactions && (
                    <MovieCardFooter
                        interactions={{ ...interactions, rating: Number(formatRating(interactions.rating)) }}
                        variant={variant}
                    />
                )}
            </View>
            <View style={[styles.infoWrapper, !isHorizontal && { flex: 0, width: "100%" }]}>
                <Text style={[styles.title, isHorizontal && styles.horizontalTitle]} numberOfLines={1}>
                    {mainTitle}
                </Text>
                {isHorizontal && !!genres && genres.length !== 0 && <Text style={styles.genres}>{subtitle}</Text>}
                {isHorizontal && !!ratingAverage && ratingAverage !== 0 && (
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
