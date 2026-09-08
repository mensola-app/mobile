import { useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router";

import { MovieListDetailView } from "@/components/MovieListDetail";
import EditListBottomSheet from "@/components/EditListBottomSheet";
import { useMovieListDetails } from "@/hooks/movie/useMovieListDetails";
import { useGlobalUser } from "@/context/AuthContext";
import { MovieListId } from "@/types/common.types";
import { Colors } from "@/constants/colors";

export default function MovieListDetailPage() {
    const { listId } = useLocalSearchParams<{ listId?: MovieListId }>();
    const { user } = useGlobalUser();
    const [isEditSheetVisible, setIsEditSheetVisible] = useState(false);

    const {
        listDetails,
        movies,
        loadMoreMovies,
        hasNextMoviePage,
        isFetchingNextMoviePage,
        interactions,
        loadMoreInteractions,
        hasNextInteractionsPage,
        isFetchingNextInteractionPage,
        isLoading,
        isRefetching,
        error,
        refetchAll,
        toggleLike,
        toggleSave,
        submitInteraction,
    } = useMovieListDetails(listId);

    const isOwner = Boolean(
        user?.id &&
            listDetails &&
            (listDetails.creatorId === user.id ||
                listDetails.owners?.some((owner) => owner.id === user.id)),
    );

    return (
        <>
            <Stack.Screen
                options={
                    {
                        headerTransparent: true,
                        title: listDetails?.title || "Film Listesi",
                        headerRightActions: isOwner
                            ? [
                                  {
                                      id: "edit-movie-list",
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
            <MovieListDetailView
                listDetails={listDetails}
                movies={movies}
                loadMoreMovies={loadMoreMovies}
                hasNextMoviePage={hasNextMoviePage}
                isFetchingNextMoviePage={isFetchingNextMoviePage}
                interactions={interactions}
                loadMoreInteractions={loadMoreInteractions}
                hasNextInteractionsPage={hasNextInteractionsPage}
                isFetchingNextInteractionPage={isFetchingNextInteractionPage}
                isLoading={isLoading}
                isRefetching={isRefetching}
                error={error}
                refetchAll={refetchAll}
                toggleLike={toggleLike}
                toggleSave={toggleSave}
                submitInteraction={submitInteraction}
            />

            {listDetails && (
                <EditListBottomSheet
                    isVisible={isEditSheetVisible}
                    onClose={() => setIsEditSheetVisible(false)}
                    type="movie-lists"
                    listId={listDetails.id}
                    initialTitle={listDetails.title}
                    initialDescription={listDetails.description}
                    initialImage={
                        typeof listDetails.image === "string"
                            ? listDetails.image
                            : (listDetails.image as any)?.toString() || null
                    }
                    initialIsPrivate={listDetails.isPrivate ?? false}
                    onSuccess={() => refetchAll()}
                />
            )}
        </>
    );
}

