import { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import MovieHero from "./MovieHero";
import MovieOverview from "./MovieOverview";
import LatestComments from "./LatestComments";
import { MovieDetailViewProps } from "./types";
import { Colors } from "@/constants/colors";

export default function MovieDetailView({
    movie,
    isLoading,
    isRefreshing,
    error,
    refetch,
}: MovieDetailViewProps) {
    const [isInteractionSheetOpen, setIsInteractionSheetOpen] = useState<boolean>(false);
    const [localRefreshing, setLocalRefreshing] = useState<boolean>(false);

    const handleRefresh = async () => {
        if (!refetch) return;
        setLocalRefreshing(true);
        try {
            await refetch();
        } finally {
            setLocalRefreshing(false);
        }
    };

    const isRefreshActive = isRefreshing ?? localRefreshing;

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
                refetch ? (
                    <RefreshControl
                        refreshing={isRefreshActive}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                ) : undefined
            }
        >
            <MovieHero
                movie={movie}
                isLoading={isLoading}
                error={error}
                isInteractionSheetOpen={isInteractionSheetOpen}
                onInteractionSheetOpenChange={setIsInteractionSheetOpen}
            />
            <MovieOverview movie={movie} />
            <LatestComments
                targetId={movie?.id}
                movieTitle={movie?.title}
                interactions={movie?.interactions ?? []}
                onRateReviewPress={() => setIsInteractionSheetOpen(true)}
            />
        </ScrollView>
    );
}