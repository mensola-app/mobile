import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { ArtistDetailView } from "@/components/ArtistDetail";
import { useArtistDetails } from "@/hooks/artist/useArtistDetails";
import { Colors } from "@/constants/colors";

export default function ArtistDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { details, isLoading, error, isFollowLoading, toggleFollow, refetch } = useArtistDetails(id);

    return (
        <>
            <Stack.Screen
                options={{
                    headerTransparent: true,
                    title: details?.name || "",
                    headerTintColor: Colors.textPrimary,
                }}
            />
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <ArtistDetailView
                    artistDetails={details}
                    isLoading={isLoading}
                    error={error}
                    isFollowLoading={isFollowLoading}
                    onToggleFollow={toggleFollow}
                    onRefetch={refetch}
                />
            </View>
        </>
    );
}
