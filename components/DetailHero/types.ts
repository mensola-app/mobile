import React from "react";
import { ImageStyle, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface IDetailHeroCoverProps {
    imageUri?: string | null;
    placeholderIcon?: keyof typeof Ionicons.glyphMap;
    aspectRatio?: number;
    borderRadius?: number;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle | ImageStyle>;
    testID?: string;
}

export interface IDetailHeroProps {
    bannerImageUri?: string | null;
    cover: React.ReactNode;
    title: React.ReactNode;
    titleRight?: React.ReactNode;
    subtitle?: React.ReactNode;
    stats?: React.ReactNode;
    actions?: React.ReactNode;
    description?: string | null;
    descriptionNumberOfLines?: number;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
