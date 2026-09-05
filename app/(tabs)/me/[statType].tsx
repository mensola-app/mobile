import { useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useStatDetails } from "../../../hooks/profile/useStatDetails";
import { useGlobalUser } from "../../../context/AuthContext";
import { getStatTitle } from "../../../constants/pageTitles";
import { StatDetailView } from "@/components/StatDetailView";
import CreateListBottomSheet from "@/components/CreateListBottomSheet";
import { StatType } from "@/types/stat.types";
import { UserId } from "@/types/common.types";
import { Colors } from "@/constants/colors";

export default function StatDetailPage() {
    const { t } = useTranslation();
    const { statType } = useLocalSearchParams<{ statType: StatType }>();
    const pageTitle = getStatTitle(statType, t);
    const [isCreateSheetVisible, setIsCreateSheetVisible] = useState(false);

    const { user } = useGlobalUser();

    const { statData, fetchNextPage, refetch, hasNextPage, isFetchingNextPage, isLoading, isError, isRefetching } =
        useStatDetails({
            statType,
            userId: user?.id,
        });

    const isCreatableType = statType === "playlists" || statType === "movie-lists";

    return (
        <>
            <Stack.Screen
                options={
                    {
                        title: pageTitle,
                        headerRightActions: isCreatableType
                            ? [
                                  {
                                      id: "add-list",
                                      icon: "add",
                                      size: 26,
                                      color: Colors.textPrimary,
                                      onPress: () => setIsCreateSheetVisible(true),
                                  },
                              ]
                            : undefined,
                    } as any
                }
            />
            <StatDetailView
                currentUserId={user?.id as UserId}
                statType={statType}
                items={statData}
                loadMore={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isLoading={isLoading}
                isRefetching={isRefetching}
                isError={isError}
                refetch={refetch}
                isOwnProfile={true}
            />

            {isCreatableType && (
                <CreateListBottomSheet
                    isVisible={isCreateSheetVisible}
                    onClose={() => setIsCreateSheetVisible(false)}
                    type={statType as "movie-lists" | "playlists"}
                    onSuccess={() => refetch()}
                />
            )}
        </>
    );
}
