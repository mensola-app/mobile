import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

// Horizontal card row: image 70x70 (music) or 70x105 (movie, 2:3)
const IMAGE_SIZE = 70;
const MOVIE_IMAGE_HEIGHT = Math.round(IMAGE_SIZE * 1.5); // 2:3 ratio

const ROW_COUNT = 7;

interface SearchSkeletonProps {
    /** "movie" uses a taller 2:3 poster, otherwise square */
    variant?: "movie" | "track" | "user";
}

export default function SearchSkeleton({ variant = "track" }: SearchSkeletonProps) {
    const isMovie = variant === "movie";
    const isUser = variant === "user";

    const imageHeight = isMovie ? MOVIE_IMAGE_HEIGHT : IMAGE_SIZE;
    const imageRadius = isUser ? IMAGE_SIZE / 2 : 10;
    const rowHeight = isMovie ? MOVIE_IMAGE_HEIGHT : IMAGE_SIZE;

    return (
        <View style={styles.container}>
            {Array.from({ length: ROW_COUNT }).map((_, i) => (
                <View key={i} style={[styles.row, { height: rowHeight }]}>
                    {/* Left: image thumbnail */}
                    <SkeletonBox
                        width={IMAGE_SIZE}
                        height={imageHeight}
                        borderRadius={imageRadius}
                    />
                    {/* Right: text lines */}
                    <View style={styles.textBlock}>
                        <SkeletonBox width={width * 0.45} height={14} borderRadius={6} />
                        <SkeletonBox width={width * 0.3} height={12} borderRadius={5} style={styles.mt6} />
                        {isMovie && (
                            <SkeletonBox width={width * 0.22} height={11} borderRadius={5} style={styles.mt4} />
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 16,
        paddingTop: 8,
        gap: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    textBlock: {
        flex: 1,
        justifyContent: "center",
    },
    mt4: { marginTop: 4 },
    mt6: { marginTop: 6 },
});
