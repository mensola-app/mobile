import React from "react";
import { Dimensions, View } from "react-native";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { skeletonStyles } from "./styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HERO_HEIGHT = 260;
const CARD_WIDTH = 120;
const TRACK_SIZE = 140;

export default function HomeSkeleton() {
    return (
        <View style={skeletonStyles.wrapper}>
            {/* Hero carousel placeholder */}
            <SkeletonBox width={SCREEN_WIDTH} height={HERO_HEIGHT} borderRadius={0} />

            {/* Carousel dots */}
            <View style={skeletonStyles.dotsRow}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <SkeletonBox key={i} width={i === 0 ? 24 : 8} height={8} borderRadius={4} style={skeletonStyles.dot} />
                ))}
            </View>

            {/* Now Playing section */}
            <View style={skeletonStyles.sectionHeader}>
                <SkeletonBox width={140} height={18} borderRadius={8} />
                <SkeletonBox width={40} height={14} borderRadius={6} />
            </View>
            <View style={skeletonStyles.row}>
                {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={skeletonStyles.movieCardSkeleton}>
                        <SkeletonBox width={CARD_WIDTH} height={CARD_WIDTH * 1.5} borderRadius={10} />
                        <SkeletonBox width={CARD_WIDTH * 0.8} height={12} borderRadius={6} style={skeletonStyles.mt8} />
                        <SkeletonBox width={CARD_WIDTH * 0.55} height={10} borderRadius={5} style={skeletonStyles.mt4} />
                    </View>
                ))}
            </View>

            {/* New Tracks section */}
            <View style={skeletonStyles.sectionHeader}>
                <SkeletonBox width={160} height={18} borderRadius={8} />
                <SkeletonBox width={40} height={14} borderRadius={6} />
            </View>
            <View style={skeletonStyles.row}>
                {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={skeletonStyles.trackCardSkeleton}>
                        <SkeletonBox width={TRACK_SIZE} height={TRACK_SIZE} borderRadius={10} />
                        <SkeletonBox width={TRACK_SIZE * 0.8} height={12} borderRadius={6} style={skeletonStyles.mt8} />
                        <SkeletonBox width={TRACK_SIZE * 0.6} height={10} borderRadius={5} style={skeletonStyles.mt4} />
                    </View>
                ))}
            </View>
        </View>
    );
}
