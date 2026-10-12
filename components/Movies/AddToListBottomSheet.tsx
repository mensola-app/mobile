import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import BottomSheet from "@/components/BottomSheet";
import { useMovieLists } from "@/hooks/movie/useMovieLists";
import AddToListSheetItem from "./AddToListSheetItem";
import { styles } from "./styles";
import { IAddToListBottomSheetProps } from "./types";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";

export default function AddToListBottomSheet({
    isVisible,
    onClose,
    movieId,
    isWatchlisted,
    onStatusChange,
}: IAddToListBottomSheetProps) {
    const { t } = useTranslation();
    const {
        lists,
        isLoading,
        isLoadingMore,
        hasMore,
        actionLoadingId,
        error,
        fetchUserLists,
        loadMore,
        toggleListSelection,
    } = useMovieLists(movieId, isWatchlisted);

    useEffect(() => {
        if (isVisible && movieId) {
            fetchUserLists();
        }
    }, [isVisible, movieId, fetchUserLists]);

    const handleEndReached = useCallback(() => {
        if (hasMore && !isLoadingMore) {
            loadMore();
        }
    }, [hasMore, isLoadingMore, loadMore]);

    return (
        <BottomSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t("movies.detail.addToList")}
            showCloseButton
            scrollable={false}>
            <View style={styles.listContainer}>
                {error ? <Text style={styles.sheetError}>{error}</Text> : null}

                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ paddingVertical: 24 }} />
                ) : (
                    <FlatList
                        data={lists}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <AddToListSheetItem
                                item={item}
                                onToggle={toggleListSelection}
                                isLoading={actionLoadingId === item.id}
                                onStatusChange={onStatusChange}
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
