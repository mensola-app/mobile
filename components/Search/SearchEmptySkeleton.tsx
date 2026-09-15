import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

// 3-column grid matching SearchEmptyState's numColumns=3 layout
const COL_GAP = 8;
const H_PAD = 12; // matches search page paddingHorizontal
const ITEM_W = (width - H_PAD * 2 - COL_GAP * 2) / 3;
const MOVIE_H = ITEM_W * 1.5; // 2:3 poster
const ALBUM_H = ITEM_W;       // square cover

interface SearchEmptySkeletonProps {
    /** "movie" shows tall 2:3 posters, "track" shows square album covers */
    variant: "movie" | "track";
}

export default function SearchEmptySkeleton({ variant }: SearchEmptySkeletonProps) {
    const imageHeight = variant === "movie" ? MOVIE_H : ALBUM_H;

    return (
        <View style={styles.container}>
            {/* Section title placeholder */}
            <SkeletonBox width={200} height={18} borderRadius={8} style={styles.title} />

            {/* 9-item grid — same as SearchEmptyState (limit=9) */}
            <View style={styles.grid}>
                {Array.from({ length: 9 }).map((_, i) => (
                    <View key={i} style={styles.item}>
                        <SkeletonBox width={ITEM_W} height={imageHeight} borderRadius={10} />
                        <SkeletonBox width={ITEM_W * 0.75} height={11} borderRadius={5} style={styles.mt6} />
                        <SkeletonBox width={ITEM_W * 0.5} height={10} borderRadius={5} style={styles.mt4} />
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
    title: {
        marginHorizontal: 4,
        marginTop: 14,
        marginBottom: 14,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: COL_GAP,
        paddingHorizontal: 4,
    },
    item: {
        width: ITEM_W,
    },
    mt4: { marginTop: 4 },
    mt6: { marginTop: 6 },
});
