import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import TabBar from "../../components/TabBar";
import { useHome } from "@/hooks/home/useHome";
import { Colors } from "@/constants/colors";

export const unstable_settings = {
    initialRouteName: "home",
};

export default function TabsLayout() {
    const { t } = useTranslation();
    const { data } = useHome();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                sceneStyle: { backgroundColor: Colors.background },
            }}
            tabBar={(props: any) => <TabBar {...props} />}>
            <Tabs.Screen name="home" options={{ title: t("tabs.home") }} />
            <Tabs.Screen name="search" options={{ title: t("tabs.search") }} />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: t("tabs.notifications"),
                    tabBarBadge: data?.hasPendingFollowRequest ? true : undefined,
                }}
            />
            <Tabs.Screen name="me" options={{ title: t("tabs.profile") }} />
        </Tabs>
    );
}
