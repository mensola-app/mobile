import { useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router";

import { PlaylistDetailView } from "@/components/PlaylistDetail";
import EditListBottomSheet from "@/components/EditListBottomSheet";
import { usePlaylistDetails } from "@/hooks/playlist/usePlaylistDetails";
import { useGlobalUser } from "@/context/AuthContext";
import { PlaylistId } from "@/types/common.types";
import { PlaylistDetails } from "@/types/playlist.types";
import { Colors } from "@/constants/colors";

export default function PlaylistDetailPage() {
    const { playlistId } = useLocalSearchParams<{ playlistId?: PlaylistId }>();
    const { user } = useGlobalUser();
    const [isEditSheetVisible, setIsEditSheetVisible] = useState(false);

    const {
        refetchAll,
        playlistDetails,
        tracks,
        loadMoreTracks,
        hasNextTrackPage,
        isFetchingNextTrackPage,
        interactions,
        submitInteraction,
        loadMoreInteractions,
        hasNextInteractionsPage,
        isFetchingNextInteractionPage,
        isLoading,
        isRefetching,
        error,
        toggleLike,
    } = usePlaylistDetails(playlistId);

    const isOwner = Boolean(
        user?.id &&
            playlistDetails &&
            (playlistDetails.creatorId === user.id ||
                playlistDetails.owners?.some((owner) => owner.id === user.id)),
    );

    return (
        <>
            <Stack.Screen
                options={
                    {
                        headerTransparent: true,
                        title: playlistDetails?.title || "Playlist",
                        headerRightActions: isOwner
                            ? [
                                  {
                                      id: "edit-playlist",
                                      icon: "create-outline",
                                      size: 22,
                                      color: Colors.textPrimary,
                                      onPress: () => setIsEditSheetVisible(true),
                                  },
                              ]
                            : undefined,
                    } as any
                }
            />
            <PlaylistDetailView
                playlistDetails={playlistDetails as PlaylistDetails}
                tracks={tracks}
                loadMoreTracks={loadMoreTracks}
                hasNextTrackPage={hasNextTrackPage}
                isFetchingNextTrackPage={isFetchingNextTrackPage}
                interactions={interactions}
                loadMoreInteractions={loadMoreInteractions}
                hasNextInteractionsPage={hasNextInteractionsPage}
                isFetchingNextInteractionPage={isFetchingNextInteractionPage}
                isLoading={isLoading}
                isRefetching={isRefetching}
                error={error}
                refetchAll={refetchAll}
                toggleLike={toggleLike}
                submitInteraction={submitInteraction}
            />

            {playlistDetails && (
                <EditListBottomSheet
                    isVisible={isEditSheetVisible}
                    onClose={() => setIsEditSheetVisible(false)}
                    type="playlists"
                    listId={playlistDetails.id}
                    initialTitle={playlistDetails.title}
                    initialDescription={playlistDetails.description}
                    initialImage={
                        typeof playlistDetails.image === "string"
                            ? playlistDetails.image
                            : (playlistDetails.image as any)?.toString() || null
                    }
                    initialIsPrivate={playlistDetails.isPrivate ?? false}
                    onSuccess={() => refetchAll()}
                />
            )}
        </>
    );
}

