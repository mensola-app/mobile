import React from "react";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { IDetailHeroCoverProps } from "./types";
import { Colors } from "@/constants/colors";

export default function DetailHeroCover({
    imageUri,
    placeholderIcon = "film-outline",
    aspectRatio = 2 / 3,
    borderRadius = 16,
    children,
    style,
    testID,
}: IDetailHeroCoverProps) {
    if (children) {
        return (
            <View
                style={[
                    styles.poster,
                    { aspectRatio, borderRadius },
                    style,
                ]}
                testID={testID}
            >
                {children}
            </View>
        );
    }

    if (imageUri) {
        return (
            <Image
                source={{ uri: imageUri }}
                style={[
                    styles.poster,
                    { aspectRatio, borderRadius },
                    style as any,
                ]}
                resizeMode="cover"
                testID={testID}
            />
        );
    }

    return (
        <View
            style={[
                styles.poster,
                styles.posterPlaceholder,
                { aspectRatio, borderRadius },
                style,
            ]}
            testID={testID}
        >
            <Ionicons name={placeholderIcon} size={36} color={Colors.textSecondary} />
        </View>
    );
}
