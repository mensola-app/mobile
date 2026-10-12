import { useCallback, useEffect } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import BottomSheet from "@/components/BottomSheet";
import { useUserPlaylists } from "@/hooks/playlist/useUserPlaylists";
import AddToPlaylistSheetItem from "./AddToPlaylistSheetItem";
import { styles } from "./styles";

import { AddToPlaylistBottomSheetProps } from "./types";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";

export default function AddToPlaylistBottomSheet({ isVisible, onClose, trackId }: AddToPlaylistBottomSheetProps) {
    const { t } = useTranslation();
    const {
        playlists,
        isLoading,
        isLoadingMore,
        hasMore,
        actionLoadingId,
        error,
        fetchUserPlaylists,
        loadMore,
        togglePlaylistSelection,
    } = useUserPlaylists(trackId);

    useEffect(() => {
        if (isVisible && trackId) {
            fetchUserPlaylists();
        }
    }, [isVisible, trackId, fetchUserPlaylists]);

    const handleEndReached = useCallback(() => {
        if (hasMore && !isLoadingMore) {
            loadMore();
        }
    }, [hasMore, isLoadingMore, loadMore]);

    return (
        <BottomSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t("tracks.detail.addToPlaylist")}
            showCloseButton
            scrollable={false}>
            <View style={styles.listContainer}>
                {error ? <Text style={styles.sheetError}>{error}</Text> : null}

                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ paddingVertical: 24 }} />
                ) : playlists.length === 0 ? (
                    <Text style={styles.bottomSheetEmptyText}>{t("tracks.detail.emptyPlaylist")}</Text>
                ) : (
                    <FlatList
                        data={playlists}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <AddToPlaylistSheetItem
                                item={item}
                                onToggle={togglePlaylistSelection}
                                isLoading={actionLoadingId === item.id}
                            />
                        )}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={
                            isLoadingMore ? (
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.primary}
                                    style={{ paddingVertical: 12 }}
                                />
                            ) : null
                        }
                    />
                )}
            </View>
        </BottomSheet>
    );
}
