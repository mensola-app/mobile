import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import DynamicList from "@/components/DynamicList";
import MusicCard from "@/components/MusicCard";
import { useArtistDiscography } from "@/hooks/artist/useArtistDiscography";
import { ArtistAlbumItem } from "@/types/artist.types";
import { Colors } from "@/constants/colors";
import { usePreferences } from "@/hooks/usePreferences";
import { IHeaderAction } from "@/components/PageHeader/types";

export default function ArtistDiscographyScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const shelfLayout = usePreferences((state) => state["shelf-layout"]);
    const setPreference = usePreferences((state) => state.setPreference);
    const isGrid = shelfLayout === "grid";

    const {
        albums,
        fetchNextPage,
        refetch,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isRefetching,
        isError,
    } = useArtistDiscography({ artistId: id, limit: 10 });

    const headerRightActions: IHeaderAction[] = [
        {
            id: "toggle-layout",
            icon: isGrid ? "list-outline" : "grid-outline",
            size: 24,
            color: Colors.textPrimary,
            onPress: () => {
                setPreference("shelf-layout", isGrid ? "list" : "grid");
            },
        },
    ];

    return (
        <>
            <Stack.Screen
                options={
                    {
                        title: t("artist.discography", { defaultValue: "Diskografi" }),
                        headerTransparent: false,
                        headerTintColor: Colors.textPrimary,
                        headerRightActions,
                    } as any
                }
            />
            <View style={styles.container}>
                {isLoading && albums.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : isError && albums.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.errorText}>
                            {t("common.error", { defaultValue: "Bir hata oluştu" })}
                        </Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()} activeOpacity={0.7}>
                            <Text style={styles.retryButtonText}>
                                {t("common.retry", { defaultValue: "Tekrar Dene" })}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : albums.length === 0 ? (
                    <ScrollView
                        contentContainerStyle={styles.centerContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={refetch}
                                tintColor={Colors.primary}
                                colors={[Colors.primary]}
                            />
                        }
                    >
                        <Text style={styles.emptyText}>
                            {t("artist.emptyDiscography", { defaultValue: "Henüz albüm bulunamadı" })}
                        </Text>
                    </ScrollView>
                ) : (
                    <DynamicList<ArtistAlbumItem>
                        key={isGrid ? "grid" : "list"}
                        data={albums}
                        variant="vertical"
                        numColumns={isGrid ? 3 : 1}
                        columnWrapperStyle={isGrid ? styles.rowWrapper : undefined}
                        contentContainerStyle={styles.listContent}
                        onRefresh={refetch}
                        refreshing={isRefetching}
                        onEndReached={() => {
                            if (hasNextPage && !isFetchingNextPage) {
                                fetchNextPage();
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            isFetchingNextPage ? (
                                <View style={styles.footerLoading}>
                                    <ActivityIndicator size="small" color={Colors.primary} />
                                </View>
                            ) : null
                        }
                        renderItem={({ item }) => (
                            <MusicCard
                                type="album"
                                layout={isGrid ? "vertical" : "horizontal"}
                                data={{
                                    spotifyId: (item.spotifyId || item.id) as any,
                                    title: item.title || item.name,
                                    image: item.image || item.images?.[0]?.url,
                                    releaseYear: item.releaseYear,
                                    artists: (item.artists || []) as any,
                                }}
                                style={isGrid ? styles.gridCard : styles.listCard}
                                onPress={() => router.push(`/albums/${item.spotifyId || item.id}?type=spotify`)}
                            />
                        )}
                    />
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
    },
    rowWrapper: {
        justifyContent: "flex-start",
        gap: 12,
        marginBottom: 16,
    },
    gridCard: {
        width: "31%",
    },
    listCard: {
        marginBottom: 12,
    },
    footerLoading: {
        paddingVertical: 16,
        alignItems: "center",
    },
    errorText: {
        color: Colors.textSecondary,
        fontSize: 15,
        marginBottom: 16,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 15,
        textAlign: "center",
    },
});
