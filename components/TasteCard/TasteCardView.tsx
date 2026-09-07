import React from "react";
import { View, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import Button from "@/components/Button";
import { Colors } from "@/constants/colors";
import TasteCard from "./TasteCard";
import { styles } from "./styles";
import { ITasteCardViewProps } from "./types";

export default function TasteCardView({
    cardRef,
    user,
    favoriteMovies,
    favoriteTracks,
    isSharing,
    onClose,
    onShare,
}: ITasteCardViewProps) {
    const { t } = useTranslation();

    return (
        <View style={styles.overlayContainer}>
            {/* Backdrop touch to close */}
            <Pressable style={styles.backdrop} onPress={onClose} />

            <View style={styles.contentWrapper} pointerEvents="box-none">
                {/* Close Button Header */}
                <View style={styles.topActionsRow}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                        testID="taste-card-close-button"
                        accessibilityLabel="Kapat">
                        <Ionicons name="close" size={22} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* 4:5 Taste Card (Visible with rounded corners) */}
                <View style={styles.cardOuterWrapper}>
                    <TasteCard
                        user={user}
                        favoriteMovies={favoriteMovies}
                        favoriteTracks={favoriteTracks}
                    />
                </View>

                {/* Off-screen Taste Card for Sharing (Square corners: borderRadius 0) */}
                <View style={styles.hiddenCaptureContainer} pointerEvents="none" collapsable={false}>
                    <TasteCard
                        ref={cardRef}
                        user={user}
                        favoriteMovies={favoriteMovies}
                        favoriteTracks={favoriteTracks}
                        squareCorners
                    />
                </View>

                {/* Share Button Under the Card */}
                <View style={styles.shareActionContainer}>
                    <Button
                        label={t("profile.tasteCard.shareButton", { defaultValue: "Fotoğraf Olarak Paylaş" })}
                        onPress={onShare}
                        isLoading={isSharing}
                        testID="taste-card-share-button"
                        style={styles.shareButton}
                        labelStyle={styles.shareButtonText}
                    />
                </View>
            </View>
        </View>
    );
}
