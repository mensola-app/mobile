import { StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export interface EmptyStateAction {
    label: string;
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    testID?: string;
}

export interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap | React.ReactNode;
    iconColor?: string;
    iconSize?: number;
    title: string;
    subtitle?: string;
    action?: EmptyStateAction;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
