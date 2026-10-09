import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Colors } from "@/constants/colors";

interface ToggleProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    thumbColor?: string;
}

export default function Toggle({
    value,
    onValueChange,
    disabled = false,
    activeColor = Colors.primary,
    inactiveColor = Colors.border,
    thumbColor = Colors.textPrimary,
}: ToggleProps) {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: false, // Color interpolation and position calculations require JS thread
        }).start();
    }, [value, animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 18], // Container width (42) - Thumb diameter (22) - padding (2) = 18
    });

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveColor, activeColor],
    });

    return (
        <TouchableWithoutFeedback
            disabled={disabled}
            onPress={() => !disabled && onValueChange(!value)}
        >
            <Animated.View style={[styles.container, { backgroundColor, opacity: disabled ? 0.5 : 1 }]}>
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            backgroundColor: thumbColor,
                            transform: [{ translateX }],
                        },
                    ]}
                />
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 42,
        height: 26,
        borderRadius: 13,
        padding: 2,
        justifyContent: "center",
    },
    thumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1.5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
});
