import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

const BANNER_HEIGHT = 310;
const POSTER_SIZE = 110;
const COMMENT_COUNT = 3;

export default function TrackDetailSkeleton() {
    return (
        <ScrollView
            style={styles.container}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}>
            {/* Hero banner */}
            <View style={[styles.heroBanner, { height: BANNER_HEIGHT }]}>
                <SkeletonBox width={width} height={BANNER_HEIGHT} borderRadius={0} />

                {/* Overlay content: poster + info */}
                <View style={styles.bannerContent}>
                    {/* Square album / track art */}
                    <SkeletonBox width={POSTER_SIZE} height={POSTER_SIZE} borderRadius={12} />

                    {/* Right-side info */}
                    <View style={styles.infoContainer}>
                        <SkeletonBox width="80%" height={22} borderRadius={8} />
                        <SkeletonBox width="55%" height={14} borderRadius={6} style={styles.mt6} />
                        <SkeletonBox width="45%" height={12} borderRadius={5} style={styles.mt4} />

                        {/* Action buttons row */}
                        <View style={styles.actionBar}>
                            <SkeletonBox width={32} height={32} borderRadius={8} />
                            <SkeletonBox width={32} height={32} borderRadius={8} />
                            <SkeletonBox width={32} height={32} borderRadius={8} />
                            <SkeletonBox width={32} height={32} borderRadius={8} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Comments section */}
            <View style={styles.commentsSection}>
                {/* Section title */}
                <View style={styles.commentsHeader}>
                    <SkeletonBox width={160} height={18} borderRadius={8} />
                    <SkeletonBox width={52} height={14} borderRadius={6} />
                </View>

                {/* Comment rows */}
                {Array.from({ length: COMMENT_COUNT }).map((_, i) => (
                    <View key={i} style={styles.commentRow}>
                        {/* Avatar */}
                        <SkeletonBox width={36} height={36} borderRadius={18} />
                        <View style={styles.commentContent}>
                            <SkeletonBox width={120} height={13} borderRadius={6} />
                            <SkeletonBox width={width * 0.65} height={12} borderRadius={5} style={styles.mt4} />
                            <SkeletonBox width={width * 0.5} height={12} borderRadius={5} style={styles.mt4} />
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    heroBanner: {
        width: "100%",
        position: "relative",
        overflow: "hidden",
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
        gap: 2,
    },
    actionBar: {
        flexDirection: "row",
        gap: 8,
        marginTop: 10,
    },
    commentsSection: {
        paddingHorizontal: 16,
        paddingTop: 14,
        gap: 16,
    },
    commentsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    commentRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    commentContent: {
        flex: 1,
        gap: 0,
    },
    mt4: { marginTop: 4 },
    mt6: { marginTop: 6 },
});
