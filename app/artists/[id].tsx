import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { ArtistDetailView } from "@/components/ArtistDetail";
import { useArtistDetails } from "@/hooks/artist/useArtistDetails";
import { Colors } from "@/constants/colors";

export default function ArtistDetailScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { details, isLoading, isRefreshing, error, isFollowLoading, toggleFollow, refetch } = useArtistDetails(id);

    return (
        <>
            <Stack.Screen
                options={{
                    headerTransparent: true,
                    title: details?.name || t("common.artist", "Sanatçı"),
                    headerTintColor: Colors.textPrimary,
                }}
            />
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <ArtistDetailView
                    artistDetails={details}
                    isLoading={isLoading}
                    isRefreshing={isRefreshing}
                    error={error}
                    isFollowLoading={isFollowLoading}
                    onToggleFollow={toggleFollow}
                    onRefetch={refetch}
                />
            </View>
        </>
    );
}
