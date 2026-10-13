import React, { useState, useEffect } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import BottomSheet from "@/components/BottomSheet";
import { styles } from "./styles";
import { IInteractionSheetProps } from "./types";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";

export default function InteractionSheet({
    isVisible,
    onClose,
    targetType,
    targetId,
    mediaTitle,
    mediaTypeTitle,
    mediaPoster,
    initialRating = 0,
    initialComment = "",
    initialIsLiked = false,
    onSubmit,
    isLoading = false,
}: IInteractionSheetProps) {
    const { t } = useTranslation();
    const [rating, setRating] = useState<number>(initialRating);
    const [comment, setComment] = useState<string>(initialComment);
    const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (isVisible) {
            setRating(initialRating);
            setComment(initialComment);
            setIsLiked(initialIsLiked);
        }
    }, [isVisible, initialRating, initialComment, initialIsLiked]);

    const handleStarPress = (selectedStar: number) => {
        if (rating === selectedStar) {
            setRating(0);
        } else {
            setRating(selectedStar);
        }
    };

    const handleToggleLike = () => {
        setIsLiked((prev) => !prev);
    };

    const handleSubmit = async () => {
        if (!onSubmit) {
            onClose();
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ rating, comment, isLiked });
            onClose();
        } catch (error) {
            // Error handling managed by onSubmit callback
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayType =
        mediaTypeTitle ||
        (targetType === "movie"
            ? t("common.movie")
            : targetType === "track"
              ? t("common.track")
              : targetType === "playlist"
                ? t("common.playlist")
                : targetType === "album"
                  ? t("common.album")
                  : t("common.content"));
    const isPortraitMedia = targetType === "movie" || targetType === "movieList";
    const posterStyle = isPortraitMedia ? styles.poster2x3 : styles.posterSquare;

    return (
        <BottomSheet isVisible={isVisible} onClose={onClose} title={t("interactions.sheet.title")} showCloseButton>
            <View style={styles.container}>
                {/* Media Header */}
                <View style={styles.headerRow}>
                    {mediaPoster ? (
                        <Image
                            source={{ uri: mediaPoster.toString() }}
                            style={posterStyle}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={150}
                        />
                    ) : null}
                    <View style={styles.headerInfo}>
                        <Text style={styles.mediaTitle} numberOfLines={1}>
                            {mediaTitle}
                        </Text>
                        <View style={styles.mediaTypeBadge}>
                            <Text style={styles.mediaTypeBadgeText}>{displayType}</Text>
                        </View>
                    </View>
                </View>

                {/* Rating Section (10 Stars) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t("interactions.sheet.ratingTitle")}</Text>
                        <Text style={styles.ratingValue}>{rating > 0 ? `${rating} / 10` : t("interactions.sheet.noRating")}</Text>
                    </View>
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starIndex) => (
                            <TouchableOpacity
                                key={starIndex}
                                style={styles.starButton}
                                onPress={() => handleStarPress(starIndex)}
                                activeOpacity={0.7}>
                                <Ionicons
                                    name={starIndex <= rating ? "star" : "star-outline"}
                                    size={24}
                                    color={starIndex <= rating ? "#FF8000" : Colors.border}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Like Toggle Section */}
                <TouchableOpacity style={styles.likeRow} onPress={handleToggleLike} activeOpacity={0.8}>
                    <View style={styles.likeLeft}>
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={22}
                            color={isLiked ? "#FF3B30" : "#A7A7A7"}
                        />
                        <Text style={styles.likeText}>{t("interactions.sheet.addToLikes")}</Text>
                    </View>
                    <Ionicons
                        name={isLiked ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={isLiked ? "#1DB954" : "#555555"}
                    />
                </TouchableOpacity>

                {/* Comment Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("interactions.sheet.commentTitle")}</Text>
                    <TextInput
                        style={styles.commentInput}
                        placeholder={t("interactions.sheet.commentPlaceholder")}
                        placeholderTextColor="#777777"
                        multiline
                        numberOfLines={3}
                        value={comment}
                        onChangeText={setComment}
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, (isLoading || isSubmitting) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading || isSubmitting}
                    activeOpacity={0.8}>
                    {isLoading || isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>{t("interactions.sheet.save")}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
}
