import React, { useRef, useState, useMemo } from "react";
import { View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import TasteCardView from "@/components/TasteCard";
import { MovieSummaryViaInteraction } from "@/types/movie.types";
import { ITrack } from "@/types/track.types";
import { IUser } from "@/types/user.types";

export default function TasteCardModal() {
    const router = useRouter();
    const { t } = useTranslation();
    const params = useLocalSearchParams<{
        user?: string;
        favoriteMovies?: string;
        favoriteTracks?: string;
    }>();

    const cardRef = useRef<View>(null);
    const [isSharing, setIsSharing] = useState(false);

    const user: Partial<IUser> | null = useMemo(() => {
        try {
            return params.user ? JSON.parse(params.user) : null;
        } catch {
            return null;
        }
    }, [params.user]);

    const favoriteMovies: MovieSummaryViaInteraction[] = useMemo(() => {
        try {
            return params.favoriteMovies ? JSON.parse(params.favoriteMovies) : [];
        } catch {
            return [];
        }
    }, [params.favoriteMovies]);

    const favoriteTracks: ITrack[] = useMemo(() => {
        try {
            return params.favoriteTracks ? JSON.parse(params.favoriteTracks) : [];
        } catch {
            return [];
        }
    }, [params.favoriteTracks]);

    const handleShare = async () => {
        if (isSharing) return;

        try {
            setIsSharing(true);
            if (!cardRef.current) return;

            const uri = await captureRef(cardRef, {
                format: "png",
                quality: 1,
                result: "tmpfile",
            });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri, {
                    mimeType: "image/png",
                    dialogTitle: t("profile.tasteCard.shareDialogTitle", { defaultValue: "Taste Card Paylaş" }),
                    UTI: "public.png",
                });
            } else {
                Alert.alert(
                    t("profile.tasteCard.title", { defaultValue: "Taste Card" }),
                    t("profile.tasteCard.shareError", {
                        defaultValue: "Paylaşım bu cihazda desteklenmiyor.",
                    }),
                );
            }
        } catch (error) {
            console.error("Taste card capture error:", error);
            Alert.alert(
                t("profile.tasteCard.title", { defaultValue: "Taste Card" }),
                t("profile.tasteCard.shareError", {
                    defaultValue: "Taste Card paylaşılırken bir hata oluştu.",
                }),
            );
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <TasteCardView
            cardRef={cardRef}
            user={user}
            favoriteMovies={favoriteMovies}
            favoriteTracks={favoriteTracks}
            isSharing={isSharing}
            onClose={() => router.back()}
            onShare={handleShare}
        />
    );
}
