import React, { useRef, useState, useCallback } from "react";
import {
    Animated,
    FlatList,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import Badge from "@/components/Badge";
import { HeroMovie } from "@/services/home.service";
import { IHeroCarouselProps } from "./types";
import { heroStyles } from "./styles";

function HeroCard({ item, onPress }: { item: HeroMovie; onPress: () => void }) {
    return (
        <TouchableOpacity
            activeOpacity={0.88}
            onPress={onPress}
            style={heroStyles.heroCard}>
            <Image
                source={{ uri: item.backdropUrl || item.posterUrl }}
                style={heroStyles.heroImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
            />
            <LinearGradient
                colors={["transparent", "rgba(8,12,18,0.55)", "rgba(8,12,18,0.97)"]}
                locations={[0.35, 0.65, 1]}
                style={heroStyles.heroGradient}
            />
            <View style={heroStyles.heroMeta}>
                {item.rating > 0 && (
                    <Badge
                        icon={<Ionicons name="star" size={11} color="#FF8000" />}
                        value={item.rating.toFixed(1)}
                        style={heroStyles.ratingBadge}
                    />
                )}
                <Text style={heroStyles.heroTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={heroStyles.heroOverview} numberOfLines={2}>
                    {item.overview}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default function HeroCarousel({ movies, onMoviePress }: IHeroCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setActiveIndex(viewableItems[0].index);
            }
        },
        [],
    );

    return (
        <View>
            <FlatList
                data={movies}
                keyExtractor={(item) => String(item.tmdbId)}
                renderItem={({ item }) => (
                    <HeroCard item={item} onPress={() => onMoviePress(item)} />
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialNumToRender={2}
                maxToRenderPerBatch={2}
                windowSize={3}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
            <View style={heroStyles.dotsRow}>
                {movies.map((_, i) => (
                    <Animated.View
                        key={i}
                        style={[heroStyles.dot, i === activeIndex ? heroStyles.dotActive : heroStyles.dotInactive]}
                    />
                ))}
            </View>
        </View>
    );
}
