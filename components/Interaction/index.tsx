import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";
import { IInteractionViewProps } from "./types";
import Badge from "../Badge";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Avatar from "../Avatar";
import { Colors } from "@/constants/colors";

export default function InteractionView({ data, disabled = false }: IInteractionViewProps) {
    const { user, comment, likesCount, replyCount, ...interaction } = data;
    const router = useRouter();

    const formatDate = (date: Date | string): string => {
        const parsedDate = typeof date === "string" ? new Date(date) : date;

        if (Number.isNaN(parsedDate.getTime())) {
            return "Bilinmiyor";
        }

        return parsedDate.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const hasRating = typeof interaction.rating === "number" && interaction.rating > 0;

    const handleUserPress = () => {
        router.push({ pathname: "/users/[userId]", params: { userId: user.id } });
    };

    /** Navigate to the comment thread screen passing the interaction data as context */
    const handleInteractionPress = () => {
        if (!comment?.id) return;
        router.push({
            pathname: "/comments/[commentId]",
            params: {
                commentId: comment.id as string,
                interactionData: JSON.stringify(data),
            },
        });
    };

    const handleReplyPress = () => {
        if (!comment?.id) return;
        router.push({
            pathname: "/comments/[commentId]",
            params: {
                commentId: comment.id as string,
                interactionData: JSON.stringify(data),
            },
        });
    };

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.cardContent}
                disabled={disabled}
                onPress={disabled ? undefined : handleInteractionPress}
                android_ripple={disabled ? undefined : { color: "rgba(74, 158, 255, 0.2)" }}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.userInfoContainer} onPress={handleUserPress} activeOpacity={0.8}>
                        <Avatar size={38} user={user} />
                        <View style={styles.nameWrapper}>
                            <Text style={styles.fullname}>{user.fullname || user.username}</Text>
                            <Text style={styles.username}>@{user.username}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.interactionInfo}>
                        <Text style={styles.date}>{comment.date && formatDate(comment.date)}</Text>
                        <View style={styles.badges}>
                            {hasRating ? (
                                <Badge
                                    icon={<Ionicons name="star" color="#FF8000" />}
                                    value={interaction.rating}
                                    style={styles.badgeItem}
                                />
                            ) : null}
                            {interaction.isLiked ? (
                                <Badge icon={<Ionicons name="heart" color="#FF8000" />} style={styles.badgeItem} />
                            ) : null}
                        </View>
                    </View>
                </View>

                <Pressable
                    style={styles.commentContainer}
                    disabled={disabled}
                    onPress={disabled ? undefined : handleInteractionPress}
                    android_ripple={disabled ? undefined : { color: "rgba(74, 158, 255, 0.2)" }}>
                    <Text style={styles.comment}>{comment.content}</Text>
                </Pressable>

                {/* Action buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => {}}>
                        <Ionicons name="heart-outline" size={14} color={Colors.primary} />
                        {likesCount ? <Text style={styles.actionButtonText}>{likesCount}</Text> : null}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={handleReplyPress}>
                        <Ionicons name="chatbubble-outline" size={14} color={Colors.primary} />
                        {replyCount ? <Text style={styles.actionButtonText}>{replyCount}</Text> : null}
                    </TouchableOpacity>
                </View>
            </Pressable>
        </View>
    );
}

export { default as InteractionSheet } from "./InteractionSheet";
