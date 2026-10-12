import React from "react";
import { StyleSheet, View } from "react-native";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { Colors } from "@/constants/colors";
import { styles as searchStyles } from "./styles";
import { styles as dynamicListStyles } from "../DynamicList/styles";

interface SearchEmptySkeletonProps {
    /** "movie" shows tall 2:3 posters, "track" shows square album covers */
    variant: "movie" | "track";
}

const ROWS = [0, 1, 2];
const COLS = [0, 1, 2];

export default function SearchEmptySkeleton({ variant }: SearchEmptySkeletonProps) {
    const isMovie = variant === "movie";

    return (
        <View style={styles.container}>
            {/* Section title placeholder matching DynamicList header */}
            <View style={dynamicListStyles.listHeader}>
                <SkeletonBox width={180} height={18} borderRadius={8} style={styles.title} />
            </View>

            {/* 3 rows of 3 items — matching SearchEmptyState (limit=9, numColumns=3) */}
            <View style={dynamicListStyles.verticalContent}>
                {ROWS.map((rowIndex) => (
                    <View key={rowIndex} style={[searchStyles.rowWrapper, styles.row]}>
                        {COLS.map((colIndex) => (
                            <View key={colIndex} style={styles.item}>
                                <SkeletonBox
                                    width="100%"
                                    borderRadius={12}
                                    style={{ aspectRatio: isMovie ? 2 / 3 : 1 }}
                                />
                                <SkeletonBox width="80%" height={11} borderRadius={5} style={styles.mt6} />
                                <SkeletonBox width="55%" height={10} borderRadius={5} style={styles.mt4} />
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: Colors.background,
    },
    title: {
        marginHorizontal: 24,
        marginTop: 12,
        marginBottom: 16,
    },
    row: {
        flexDirection: "row",
        marginBottom: 16,
    },
    item: {
        width: "31%",
    },
    mt4: { marginTop: 4 },
    mt6: { marginTop: 6 },
});

