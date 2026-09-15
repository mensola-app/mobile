import React from "react";
import { Dimensions, ScrollView, View, StyleSheet } from "react-native";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48 - 24) / 3;

export default function ProfileSkeleton() {
    return (
        <ScrollView
            style={styles.scroll}
            scrollEnabled={false}
            contentContainerStyle={styles.content}>
            {/* Header: Avatar + name + username + bio */}
            <View style={styles.headerWrapper}>
                {/* Avatar ring */}
                <SkeletonBox width={86} height={86} borderRadius={43} />

                {/* Fullname + username */}
                <View style={styles.nameBlock}>
                    <SkeletonBox width={140} height={18} borderRadius={8} />
                    <SkeletonBox width={90} height={13} borderRadius={6} style={styles.mt6} />
                </View>

                {/* Bio */}
                <View style={styles.bioBlock}>
                    <SkeletonBox width={width * 0.65} height={12} borderRadius={6} />
                    <SkeletonBox width={width * 0.45} height={12} borderRadius={6} style={styles.mt4} />
                </View>

                {/* Stats row - 3 items: Watched, Followers, Following */}
                <View style={styles.statsRow}>
                    {[0, 1, 2].map((i) => (
                        <SkeletonBox key={i} width={(width - 40 - 16) / 3} height={54} borderRadius={12} />
                    ))}
                </View>

                {/* Action buttons row: big btn + wide btn + small square */}
                <View style={styles.actionRow}>
                    <SkeletonBox width={(width - 48 - 10) * 0.55} height={36} borderRadius={10} />
                    <SkeletonBox width={(width - 48 - 10) * 0.35} height={36} borderRadius={10} />
                    <SkeletonBox width={38} height={38} borderRadius={10} />
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Favorite Movies */}
            <View style={styles.section}>
                <SkeletonBox width={160} height={18} borderRadius={8} style={styles.sectionTitle} />
                <View style={styles.gridRow}>
                    {[0, 1, 2].map((i) => (
                        <View key={i}>
                            <SkeletonBox width={ITEM_WIDTH} height={ITEM_WIDTH * 1.5} borderRadius={12} />
                            <SkeletonBox width={ITEM_WIDTH * 0.75} height={11} borderRadius={5} style={styles.mt6} />
                            <SkeletonBox width={ITEM_WIDTH * 0.5} height={10} borderRadius={5} style={styles.mt4} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Favorite Tracks */}
            <View style={styles.section}>
                <SkeletonBox width={180} height={18} borderRadius={8} style={styles.sectionTitle} />
                <View style={styles.gridRow}>
                    {[0, 1, 2].map((i) => (
                        <View key={i}>
                            <SkeletonBox width={ITEM_WIDTH} height={ITEM_WIDTH} borderRadius={12} />
                            <SkeletonBox width={ITEM_WIDTH * 0.75} height={11} borderRadius={5} style={styles.mt6} />
                            <SkeletonBox width={ITEM_WIDTH * 0.5} height={10} borderRadius={5} style={styles.mt4} />
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: Colors.background,
    },
    content: {
        paddingBottom: 120,
    },
    headerWrapper: {
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 20,
        paddingHorizontal: 20,
        gap: 12,
    },
    nameBlock: {
        alignItems: "center",
        gap: 6,
    },
    bioBlock: {
        alignItems: "center",
    },
    actionRow: {
        flexDirection: "row",
        gap: 10,
        width: "100%",
        alignItems: "center",
    },
    statsRow: {
        flexDirection: "row",
        gap: 8,
        width: "100%",
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginHorizontal: 20,
        marginVertical: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        marginHorizontal: 24,
        marginTop: 12,
        marginBottom: 16,
    },
    gridRow: {
        flexDirection: "row",
        paddingHorizontal: 24,
        gap: 12,
    },
    mt4: { marginTop: 4 },
    mt6: { marginTop: 6 },
});
