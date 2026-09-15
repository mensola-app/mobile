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
import { usePreferences } from "@/hooks/usePreferences";
import { IHeaderAction } from "@/components/PageHeader/types";

export default function StatDetailPage() {
    const { t } = useTranslation();
    const { statType } = useLocalSearchParams<{ statType: StatType }>();
    const pageTitle = getStatTitle(statType, t);
    const [isCreateSheetVisible, setIsCreateSheetVisible] = useState(false);

    const { user } = useGlobalUser();
    const shelfLayout = usePreferences((state) => state["shelf-layout"]);
    const setPreference = usePreferences((state) => state.setPreference);

    const { statData, fetchNextPage, refetch, hasNextPage, isFetchingNextPage, isLoading, isError, isRefetching } =
        useStatDetails({
            statType,
            userId: user?.id,
        });

    const isCreatableType = statType === "playlists" || statType === "movie-lists";
    const isLayoutSupported = statType !== "followers" && statType !== "following";

    const headerRightActions: IHeaderAction[] = [];

    if (isLayoutSupported) {
        headerRightActions.push({
            id: "toggle-layout",
            icon: shelfLayout === "grid" ? "list-outline" : "grid-outline",
            size: 24,
            color: Colors.textMuted,
            onPress: () => {
                setPreference("shelf-layout", shelfLayout === "grid" ? "list" : "grid");
            },
        });
    }

    if (isCreatableType) {
        headerRightActions.push({
            id: "add-list",
            icon: "add",
            size: 26,
            color: Colors.textMuted,
            onPress: () => setIsCreateSheetVisible(true),
        });
    }

    return (
        <>
            <Stack.Screen
                options={
                    {
                        title: pageTitle,
                        headerRightActions: headerRightActions.length > 0 ? headerRightActions : undefined,
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
