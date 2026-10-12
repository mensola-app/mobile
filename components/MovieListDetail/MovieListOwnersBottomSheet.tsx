import { useState, useEffect } from "react";
import { FlatList, Alert, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import BottomSheet from "@/components/BottomSheet";
import UserCard from "@/components/UserCard";
import { useGlobalUser } from "@/context/AuthContext";
import { useFollow } from "@/hooks/user/useFollow";
import { IMovieListOwnersBottomSheetProps } from "./types";
import { FollowUsersResponseDataItem, IUser } from "@/types/user.types";
import { UserId } from "@/types/common.types";

export default function MovieListOwnersBottomSheet({
    isVisible,
    onClose,
    owners: initialOwners,
}: IMovieListOwnersBottomSheetProps) {
    const router = useRouter();
    const { user: currentUser } = useGlobalUser();
    const { t } = useTranslation();
    const { followHandler, unfollowHandler, error: followError } = useFollow();
    const [owners, setOwners] = useState<FollowUsersResponseDataItem[]>(initialOwners);

    useEffect(() => {
        setOwners(initialOwners);
    }, [initialOwners]);

    useEffect(() => {
        if (followError) {
            Alert.alert(t("owners.errorTitle"), followError);
        }
    }, [followError]);

    const toggleFollowState = (targetUserId: string) => {
        setOwners((prevOwners) =>
            prevOwners.map((item) => (item.id === targetUserId ? { ...item, isFollowing: !item.isFollowing } : item)),
        );
    };

    const handleFollowPress = (targetUserId: UserId, isFollowing?: boolean, isPending?: boolean) => {
        const targetUser = owners.find((o) => o.id === targetUserId);
        const name = targetUser?.fullname || targetUser?.username || t("common.user");

        if (isFollowing || isPending) {
            Alert.alert(
                isPending ? t("profile.header.cancelRequestTitle") : t("owners.unfollowTitle"),
                isPending
                    ? t("profile.header.cancelRequestBody", { name })
                    : t("owners.unfollowBody", { name }),
                [
                    { text: t("owners.cancel"), style: "cancel" },
                    {
                        text: isPending ? t("owners.cancel") : t("owners.unfollow"),
                        style: "destructive",
                        onPress: () => {
                            unfollowHandler(targetUserId, () =>
                                setOwners((prev) =>
                                    prev.map((item) =>
                                        item.id === targetUserId
                                            ? { ...item, isFollowing: false, isPending: false }
                                            : item,
                                    ),
                                ),
                            );
                        },
                    },
                ],
            );
        } else {
            followHandler(targetUserId, (data) =>
                setOwners((prev) =>
                    prev.map((item) =>
                        item.id === targetUserId
                            ? {
                                  ...item,
                                  isFollowing: data?.status === "accepted" || (!item.isPrivate && data?.status !== "pending"),
                                  isPending: data?.status === "pending" || item.isPrivate,
                              }
                            : item,
                    ),
                ),
            );
        }
    };

    const handleCardPress = (targetUserId: string) => {
        onClose();
        router.push(`/users/${targetUserId}`);
    };

    return (
        <BottomSheet isVisible={isVisible} onClose={onClose} title={t("owners.title")} scrollable={false}>
            <FlatList
                data={owners}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                renderItem={({ item, index }) => (
                    <UserCard
                        user={{
                            ...item,
                            avatar: item.avatar ?? undefined,
                            isPending: item.isPending,
                        }}
                        currentUserId={currentUser?.id as UserId}
                        onFollowPress={handleFollowPress}
                        onCardPress={handleCardPress}
                        isFirst={index === 0}
                        isLast={index === owners.length - 1}
                    />
                )}
            />
        </BottomSheet>
    );
}
