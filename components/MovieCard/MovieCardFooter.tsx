import React, { memo } from "react";
import { View } from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";

import Badge from "@/components/Badge";
import { styles } from "./styles";
import { IMovieCardFooterProps } from "./types";

export default memo(function MovieCardFooter({ interactions, variant = "profile" }: IMovieCardFooterProps) {
    const isProfile = variant === "profile";

    return (
        <View style={styles.badgeContainer}>
            {interactions.rating ? (
                <Badge
                    icon={<Ionicons name="star" size={10} color="#FF8000" />}
                    value={interactions.rating}
                    style={styles.badgeItem}
                    textStyle={styles.badgeText}
                />
            ) : null}

            {isProfile ? (
                interactions.isLiked ? (
                    <Badge icon={<Ionicons name="heart" size={10} color="#FF8000" />} style={styles.badgeItem} />
                ) : null
            ) : interactions.totalLikes && interactions.totalLikes > 0 ? (
                <Badge
                    icon={<Ionicons name="heart" size={10} color="#FF8000" />}
                    value={interactions.totalLikes}
                    style={styles.badgeItem}
                    textStyle={styles.badgeText}
                />
            ) : null}

            {isProfile ? (
                interactions.hasReview ? (
                    <Badge icon={<Entypo name="text" size={10} color="#FF8000" />} style={styles.badgeItem} />
                ) : null
            ) : interactions.totalReviews && interactions.totalReviews > 0 ? (
                <Badge
                    icon={<Entypo name="text" size={10} color="#FF8000" />}
                    value={interactions.totalReviews}
                    style={styles.badgeItem}
                    textStyle={styles.badgeText}
                />
            ) : null}
        </View>
    );
});
