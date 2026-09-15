import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";

interface SkeletonBoxProps {
    width: number | string;
    height: number | string;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
}

/**
 * Reusable shimmer skeleton box.
 * All skeleton screens in the app should use this component
 * to ensure consistent animation behaviour and colour.
 */
export default function SkeletonBox({ width, height, borderRadius = 12, style }: SkeletonBoxProps) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [anim]);

    const opacity = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 0.5],
    });

    return (
        <Animated.View
            style={[
                {
                    width: width as number,
                    height: height as number,
                    borderRadius,
                    backgroundColor: Colors.surfaceLight,
                    opacity,
                },
                style,
            ]}
        />
    );
}
