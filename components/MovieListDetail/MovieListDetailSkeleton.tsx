import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

const BANNER_HEIGHT = 310;
const POSTER_WIDTH = 90;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5; // 2:3 aspect ratio
const MOVIE_ITEM_WIDTH = (width * 0.92 - 28) / 3;
const MOVIE_ITEM_HEIGHT = MOVIE_ITEM_WIDTH * 1.5;

export default function MovieListDetailSkeleton() {
    return (
        <View style={styles.container}>
            {/* Hero banner */}
            <View style={{ height: BANNER_HEIGHT, position: "relative" }}>
                <SkeletonBox width={width} height={BANNER_HEIGHT} borderRadius={0} />
                <View style={styles.bannerContent}>
                    {/* Vertical movie poster (2:3) */}
                    <SkeletonBox width={POSTER_WIDTH} height={POSTER_HEIGHT} borderRadius={10} />
                    {/* Info column */}
                    <View style={styles.infoContainer}>
                        <SkeletonBox width="80%" height={22} borderRadius={8} />
                        {/* Creator row */}
                        <View style={styles.creatorRow}>
                            <SkeletonBox width={22} height={22} borderRadius={11} />
                            <SkeletonBox width={80} height={13} borderRadius={6} />
                        </View>
                        <SkeletonBox width="45%" height={12} borderRadius={5} style={styles.mt4} />
                        <View style={styles.actionBar}>
                            <SkeletonBox width={32} height={32} borderRadius={8} />
                            <SkeletonBox width={32} height={32} borderRadius={8} />
                            <SkeletonBox width={32} height={32} borderRadius={8} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Tab bar placeholder */}
            <View style={styles.tabBar}>
                <SkeletonBox width={90} height={14} borderRadius={6} />
                <SkeletonBox width={90} height={14} borderRadius={6} />
            </View>

            {/* 3-column movie grid (2:3 posters) */}
            <View style={styles.grid}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <View key={i} style={styles.gridItem}>
                        <SkeletonBox width={MOVIE_ITEM_WIDTH} height={MOVIE_ITEM_HEIGHT} borderRadius={10} />
                        <SkeletonBox width={MOVIE_ITEM_WIDTH * 0.75} height={11} borderRadius={5} style={styles.mt6} />
                        <SkeletonBox width={MOVIE_ITEM_WIDTH * 0.5} height={10} borderRadius={5} style={styles.mt4} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    bannerContent: {
        position: "absolute",
        bottom: 12,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 16,
    },
    infoContainer: {
        flex: 1,
    },
    creatorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 6,
    },
    actionBar: {
        flexDirection: "row",
        gap: 8,
        marginTop: 10,
    },
    tabBar: {
        flexDirection: "row",
        gap: 24,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 14,
        paddingHorizontal: "4%",
        paddingTop: 16,
    },
    gridItem: {
        width: MOVIE_ITEM_WIDTH,
    },
    mt4: { marginTop: 4 },
    mt6: { marginTop: 6 },
});
