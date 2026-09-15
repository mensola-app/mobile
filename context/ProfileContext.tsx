import React, { createContext, useContext } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Href, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { useProfile } from "../hooks/profile/useProfile";
import { UserId } from "@/types/common.types";
import { STAT_ROUTE_MAP, StatTypeKey } from "@/types/stat.types";
import { IUser, UserFavorites, UserStats } from "@/types/user.types";
import { Colors } from "@/constants/colors";
import { useGlobalUser } from "@/context/AuthContext";
import ProfileSkeleton from "@/components/Profile/ProfileSkeleton";

export interface ProfileContextType {
    userId?: UserId | "me";
    refetch: () => Promise<void>;
    isLoading: boolean;
    headerData: IUser & {
        stats: Partial<UserStats>;
        isOwnProfile: boolean;
        isFollowingByMe?: boolean;
        isPendingByMe?: boolean;
        hasPendingRequestFromUser?: boolean;
    };
    bodyData: UserFavorites;
    footerData: { stats: Partial<UserStats> };
    isOwnProfile: boolean;
    handleStatPress: (statType: StatTypeKey) => void;
    favorites: UserFavorites;
    hasAccess: boolean;
    isPrivate: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children, userId = "me" }: { children: React.ReactNode; userId?: UserId | "me" }) {
    const { t } = useTranslation();
    const { user } = useGlobalUser();
    const { profile, fetchProfile, isLoading, error } = useProfile(userId);
    const router = useRouter();

    // Error state takes priority
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorWrapper}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchProfile} style={styles.retryBtn} activeOpacity={0.8}>
                        <Text style={styles.retryText}>{t("common.retry", { defaultValue: "Tekrar Deneyin" })}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Show skeleton while loading OR on first render before useEffect fires
    // (useProfile initialises isLoading=false, so there's a one-frame gap before
    //  isLoading flips to true — guarding on !profile covers that gap too)
    if (isLoading || !profile) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
                <ProfileSkeleton />
            </SafeAreaView>
        );
    }

    const isOwnProfile = userId === "me" || userId === user?.id;

    const handleStatPress = (statType: StatTypeKey) => {
        const basePath = isOwnProfile ? "/me" : `/users/${userId}`;
        const fullPath = `${basePath}/${STAT_ROUTE_MAP[statType]}`;

        router.push(fullPath as Href);
    };

    const {
        id,
        username,
        fullname,
        bio,
        avatar,
        favoriteMovies,
        favoriteTracks,
        mutualFollowers,
        isFollowingByMe,
        isPendingByMe,
        hasPendingRequestFromUser,
        hasAccess = true,
        isPrivate = false,
        ...stats
    } = profile;

    const activeHeaderStats = ["watchedMoviesCount", "followersCount", "followingCount"] as const;

    const headerStats = stats
        ? Object.fromEntries(activeHeaderStats.map((key) => [key as StatTypeKey, stats[key] ?? 0]))
        : {};

    const headerData = {
        id,
        username,
        fullname,
        bio,
        avatar,
        stats: headerStats,
        isOwnProfile,
        isFollowingByMe,
        isPendingByMe,
        hasPendingRequestFromUser,
    };
    const bodyData = {
        favoriteMovies: favoriteMovies?.slice(0, 3),
        favoriteTracks: favoriteTracks?.slice(0, 3),
    };
    const footerData = { stats };

    const favorites = {
        favoriteMovies,
        favoriteTracks,
    };

    return (
        <ProfileContext.Provider
            value={{
                userId,
                refetch: fetchProfile,
                isLoading,
                headerData,
                bodyData,
                footerData,
                isOwnProfile,
                handleStatPress,
                favorites,
                hasAccess,
                isPrivate,
            }}>
            {children}
        </ProfileContext.Provider>
    );
}

export const useProfileContext = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfileContext must be used within a ProfileProvider");
    }
    return context;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    errorWrapper: {
        alignItems: "center",
        paddingHorizontal: 24,
    },
    errorText: {
        color: Colors.textSecondary,
        fontSize: 15,
        textAlign: "center",
        marginBottom: 16,
    },
    retryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: Colors.primary,
        borderRadius: 8,
    },
    retryText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});
