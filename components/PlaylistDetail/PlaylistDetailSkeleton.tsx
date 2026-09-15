import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

const BANNER_HEIGHT = 310;
const COVER_SIZE = 110;
const TRACK_ITEM_WIDTH = (width * 0.92 - 28) / 3;

export default function PlaylistDetailSkeleton() {
    return (
        <View style={styles.container}>
            {/* Hero banner */}
            <View style={{ height: BANNER_HEIGHT, position: "relative" }}>
                <SkeletonBox width={width} height={BANNER_HEIGHT} borderRadius={0} />
                <View style={styles.bannerContent}>
                    {/* Square playlist cover */}
                    <SkeletonBox width={COVER_SIZE} height={COVER_SIZE} borderRadius={12} />
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

            {/* 3-column track grid */}
            <View style={styles.grid}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <View key={i} style={styles.gridItem}>
                        <SkeletonBox width={TRACK_ITEM_WIDTH} height={TRACK_ITEM_WIDTH} borderRadius={10} />
                        <SkeletonBox width={TRACK_ITEM_WIDTH * 0.75} height={11} borderRadius={5} style={styles.mt6} />
                        <SkeletonBox width={TRACK_ITEM_WIDTH * 0.5} height={10} borderRadius={5} style={styles.mt4} />
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
        width: TRACK_ITEM_WIDTH,
    },
    mt4: { marginTop: 4 },
    mt6: { marginTop: 6 },
});
