import { StatDetailProps } from "./types";
import { styles } from "./styles";
import DynamicList from "../DynamicList";
import StatDetailItem from "./StatDetailItem";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFollow } from "@/hooks/user/useFollow";
import { useRouter } from "expo-router";
import { UserId } from "@/types/common.types";
import { StatDetailsItemMap, StatType } from "@/types/stat.types";
import { FollowUsersResponseDataItem } from "@/types/user.types";
import { Colors } from "@/constants/colors";

export default function StatDetailView<T extends StatType = StatType>({
    currentUserId,
    statType,
    items,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    isError,
    refetch,
    isOwnProfile = false,
}: StatDetailProps<T>) {
    const router = useRouter();
    const { t } = useTranslation();
    const { followHandler, unfollowHandler } = useFollow();
    const [statDetailItems, setStatDetailItems] = useState(items);

    useEffect(() => setStatDetailItems(items), [items]);

    if (isError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                    {t("statDetails.errorMessage", {
                        defaultValue: "Veriler çekilirken bir hata oluştu. Lütfen tekrar deneyiniz.",
                    })}
                </Text>
                {refetch && (
                    <TouchableOpacity style={styles.retryButton} onPress={refetch} activeOpacity={0.7}>
                        <Text style={styles.retryText}>
                            {t("statDetails.retry", { defaultValue: "Tekrar Deneyin" })}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!statDetailItems || statDetailItems.length <= 0) {
        const emptyMessage =
            (statType && t(`statDetails.empty.${statType}`, { defaultValue: "" })) ||
            t("statDetails.emptyMessage", {
                defaultValue: "Şu anda burada gösterilebilecek bir veri bulunamadı",
            });

        return (
            <ScrollView
                contentContainerStyle={styles.emptyContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    refetch ? (
                        <RefreshControl
                            refreshing={isRefetching ?? false}
                            onRefresh={refetch}
                            tintColor={Colors.primary}
                            colors={[Colors.primary]}
                        />
                    ) : undefined
                }
            >
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            </ScrollView>
        );
    }

    const isGrid = [
        "watchlist",
        "watched",
        "liked-movies",
        "playlists",
        "liked-tracks",
        "liked-playlists",
        "liked-albums",
    ].includes(statType);

    const renderItem = ({ item, index }: any) => {
        switch (statType) {
            case "movie-lists":
            case "liked-movie-lists":
                return (
                    <StatDetailItem
                        viewType="dynamic-list"
                        data={item.previewMovies}
                        listTitle={item.listTitle}
                        onSeeAllPress={() => {
                            router.push(`/movie-lists/${item.listId}`);
                        }}
                        onListItemPress={(movieId: string) => {
                            router.push(`/movies/${movieId}`);
                        }}
                    />
                );
            case "playlists":
            case "liked-tracks":
            case "liked-playlists":
            case "liked-albums": {
                let cardType: "track" | "playlist" | "album" = "track";

                if (statType.includes("playlist")) {
                    cardType = "playlist";
                } else if (statType.includes("album")) {
                    cardType = "album";
                }

                const handleMusicCardPress = () => {
                    switch (cardType) {
                        case "track":
                            router.push(`/tracks/${item.id}`);
                            break;
                        case "playlist":
                            router.push(`/playlists/${item.id}`);
                            break;
                        case "album":
                            router.push(`/albums/${item.id}`);
                            break;
                    }
                };

                return (
                    <StatDetailItem
                        viewType="music-card"
                        data={item}
                        onPress={handleMusicCardPress}
                        cardType={cardType}
                        hideCreator={isOwnProfile && statType === "playlists" ? true : false}
                    />
                );
            }
            case "watchlist":
            case "watched":
            case "liked-movies":
                return (
                    <StatDetailItem
                        viewType="movie-card"
                        data={item}
                        onPress={() => {
                            router.push(`/movies/${item.id}`);
                        }}
                    />
                );
            case "followers":
            case "following": {
                const toggleFollowStateInList = (targetUserId: UserId) => {
                    setStatDetailItems((prev) => {
                        const typedPrev = prev as FollowUsersResponseDataItem[];
                        const mapped = typedPrev?.map((userItem) =>
                            userItem.id === targetUserId
                                ? { ...userItem, isFollowing: !userItem.isFollowing }
                                : userItem,
                        );
                        return mapped as StatDetailsItemMap[T][];
                    });
                };

                const handleFollowPress = (targetId: UserId, isFollowing: boolean, isPending?: boolean) => {
                    const targetName = item.fullname || item.username || "";
                    if (isFollowing || isPending) {
                        Alert.alert(
                            isPending
                                ? t("statDetails.unfollowAlert.cancelRequestTitle", { defaultValue: "İsteği İptal Et" })
                                : t("statDetails.unfollowAlert.unfollowTitle", { defaultValue: "Takipten çıkılıyor" }),
                            isPending
                                ? t("statDetails.unfollowAlert.cancelRequestBody", {
                                      name: targetName,
                                      defaultValue: `${targetName} adlı kişiye gönderilen takip isteğini iptal etmek istiyor musunuz?`,
                                  })
                                : t("statDetails.unfollowAlert.unfollowBody", {
                                      name: targetName,
                                      defaultValue: `${targetName} adlı kişiyi takip etmeyi bırakmak istiyor musunuz?`,
                                  }),
                            [
                                {
                                    text: t("statDetails.unfollowAlert.no", { defaultValue: "Hayır" }),
                                    onPress: () => {},
                                    style: "cancel",
                                },
                                {
                                    text: t("statDetails.unfollowAlert.yes", { defaultValue: "Evet" }),
                                    onPress: () =>
                                        unfollowHandler(targetId, () => {
                                            setStatDetailItems((prev) => {
                                                const typedPrev = prev as FollowUsersResponseDataItem[];
                                                const mapped = typedPrev?.map((userItem) =>
                                                    userItem.id === targetId
                                                        ? { ...userItem, isFollowing: false, isPending: false }
                                                        : userItem,
                                                );
                                                return mapped as StatDetailsItemMap[T][];
                                            });
                                        }),
                                },
                            ],
                        );
                    } else {
                        followHandler(targetId, (data) => {
                            setStatDetailItems((prev) => {
                                const typedPrev = prev as FollowUsersResponseDataItem[];
                                const mapped = typedPrev?.map((userItem) =>
                                    userItem.id === targetId
                                        ? {
                                              ...userItem,
                                              isFollowing: data?.status === "accepted" || (!userItem.isPrivate && data?.status !== "pending"),
                                              isPending: data?.status === "pending" || userItem.isPrivate,
                                          }
                                        : userItem,
                                );
                                return mapped as StatDetailsItemMap[T][];
                            });
                        });
                    }
                };
                return (
                    <StatDetailItem
                        viewType="user-card"
                        data={item}
                        onCardPress={(userId) => router.push(`/users/${userId}`)}
                        onFollowPress={handleFollowPress}
                        currentUserId={currentUserId}
                        isFirst={index === 0}
                        isLast={index === (statDetailItems?.length ?? 0) - 1}
                    />
                );
            }
        }
    };

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
            </View>
        );
    };

    const handleLoadMore = () => {
        if (!isFetchingNextPage && hasNextPage) loadMore?.();
    };

    const isUserList = statType === "followers" || statType === "following";

    return (
        <View style={styles.container}>
            <DynamicList
                data={statDetailItems}
                renderItem={renderItem}
                variant="vertical"
                onRefresh={refetch}
                refreshing={isRefetching}
                numColumns={isGrid ? 3 : 1}
                columnWrapperStyle={isGrid ? styles.rowWrapper : undefined}
                ItemSeparatorComponent={isUserList ? () => null : undefined}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
            />
        </View>
    );
}
