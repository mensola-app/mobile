import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Avatar from "../Avatar";
import { Colors } from "@/constants/colors";

export interface SearchUserRowUser {
    id: string | number;
    username: string;
    fullname?: string | null;
    avatar?: string | URL | null;
}

export interface SearchUserRowProps {
    user: SearchUserRowUser;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}

export default function SearchUserRow({ user, onPress, style, testID }: SearchUserRowProps) {
    const hasFullname = Boolean(user.fullname && user.fullname.trim().length > 0);

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
            testID={testID}
            accessibilityRole="button"
        >
            <Avatar url={user.avatar ?? undefined} name={user.fullname || user.username} size={38} />
            <View style={styles.nameContainer}>
                {hasFullname ? (
                    <>
                        <Text style={styles.fullname} numberOfLines={1}>
                            {user.fullname}
                        </Text>
                        <Text style={styles.username} numberOfLines={1}>
                            @{user.username}
                        </Text>
                    </>
                ) : (
                    <Text style={styles.fullname} numberOfLines={1}>
                        @{user.username}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 4,
        paddingVertical: 6,
        gap: 12,
    },
    nameContainer: {
        flex: 1,
        justifyContent: "center",
    },
    fullname: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    username: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
});
