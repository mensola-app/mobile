import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { ArtistService } from "@/services/artist.service";
import { ArtistDetailResponse } from "@/types/artist.types";

export const useArtistDetails = (artistId: string) => {
    const { t } = useTranslation();
    const [details, setDetails] = useState<ArtistDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);

    const fetchDetails = useCallback(async () => {
        if (!artistId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await ArtistService.getArtistDetails(artistId);
            // Handle standard API response format if it's wrapped in { success, data }
            // Looking at the API client, it seems it unwraps the success/data if we use the generic properly, 
            // but just to be safe if the response structure contains the actual object in .data
            const artistData = (data as any).data ? (data as any).data : data;
            setDetails(artistData);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [artistId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const toggleFollow = useCallback(async () => {
        if (!details || isFollowLoading) return;

        const previousIsFollowing = details.isFollowing;
        const previousFollowerCount = details.followerCount;
        
        // Optimistic update
        setDetails((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                isFollowing: !previousIsFollowing,
                followerCount: previousIsFollowing ? prev.followerCount - 1 : prev.followerCount + 1,
            };
        });

        setIsFollowLoading(true);
        try {
            if (previousIsFollowing) {
                await ArtistService.unfollowArtist(details.spotifyId || artistId);
            } else {
                await ArtistService.followArtist(details.spotifyId || artistId);
            }
        } catch (err: any) {
            // Revert optimistic update
            setDetails((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    isFollowing: previousIsFollowing,
                    followerCount: previousFollowerCount,
                };
            });
            const apiMessage = err?.error?.message || err?.message || t("common.error");
            Alert.alert(t("common.error"), apiMessage);
        } finally {
            setIsFollowLoading(false);
        }
    }, [details, artistId, isFollowLoading, t]);

    return {
        details,
        isLoading,
        error,
        refetch: fetchDetails,
        toggleFollow,
        isFollowLoading,
    };
};
