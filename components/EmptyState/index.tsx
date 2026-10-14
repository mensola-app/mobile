import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { EmptyStateProps } from "./types";
import { styles } from "./styles";

export default function EmptyState({
    icon = "information-circle-outline",
    iconColor = Colors.textMuted,
    iconSize = 32,
    title,
    subtitle,
    action,
    style,
    testID,
}: EmptyStateProps) {
    const renderIcon = () => {
        if (!icon) return null;
        if (React.isValidElement(icon)) {
            return icon;
        }
        if (typeof icon === "string") {
            return (
                <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={iconSize}
                    color={iconColor}
                />
            );
        }
        return null;
    };

    return (
        <View style={[styles.container, style]} testID={testID}>
            {icon ? (
                <View style={styles.iconOuterRing} testID={testID ? `${testID}-icon-ring` : undefined}>
                    <View style={styles.iconInnerContainer}>
                        {renderIcon()}
                    </View>
                </View>
            ) : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {action ? (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={action.onPress}
                    activeOpacity={0.8}
                    testID={action.testID}
                >
                    {action.icon ? (
                        <Ionicons
                            name={action.icon}
                            size={16}
                            color={action.iconColor || Colors.primary}
                        />
                    ) : null}
                    <Text style={styles.actionText}>{action.label}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

export * from "./types";
