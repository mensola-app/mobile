import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { styles } from "./styles";
import { IHeaderAction } from "./types";
import { NativeStackHeaderProps } from "expo-router";
import { Colors } from "@/constants/colors";

export default function PageHeader({ options, navigation, back }: NativeStackHeaderProps) {
    const insets = useSafeAreaInsets();

    const title = options.title || (typeof options.headerTitle === "string" ? options.headerTitle : "");

    const actions = (options as any).headerRightActions as IHeaderAction[] | undefined;

    const isTransparent = options.headerTransparent === true;
    const canGoBack = options.headerBackVisible !== false && Boolean(back);

    return (
        <View
            style={[
                styles.container,
                { paddingTop: insets.top },
                isTransparent && {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    elevation: 100,
                    backgroundColor: "transparent",
                },
            ]}>
            <View style={styles.content}>
                {canGoBack && (
                    <View style={styles.buttonContainer}>
                        <View style={styles.headerButton}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.headerButton}
                                activeOpacity={0.7}
                                testID="back-button">
                                <Ionicons name="chevron-back" size={24} color={Colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {title && (
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText} numberOfLines={1}>
                            {title}
                        </Text>
                    </View>
                )}

                {actions && actions.length > 0 ? (
                    <View style={[styles.buttonContainer, !title && { position: "absolute", right: 0 }]}>
                        {actions.map((action) => (
                            <View key={action.id} style={styles.headerButton}>
                                <TouchableOpacity
                                    onPress={action.onPress}
                                    activeOpacity={0.7}
                                    testID={`action-button-${action.id}`}>
                                    <Ionicons
                                        name={action.icon}
                                        size={action.size || 24}
                                        color={action.color || Colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ) : null}
            </View>
        </View>
    );
}
