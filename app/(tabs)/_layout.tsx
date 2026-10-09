import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import TabBar from "../../components/TabBar";
import { useHome } from "@/hooks/home/useHome";
import { Colors } from "@/constants/colors";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

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
                    tabBarBadge: data?.hasPendingFollowRequest ? "•" : undefined,
                }}
            />
            <Tabs.Screen
                name="me"
                options={({ route }) => {
                    const routeName = getFocusedRouteNameFromRoute(route);
                    const shouldHideTabBar = routeName === "[statType]";
                    return {
                        title: t("tabs.profile"),
                        tabBarStyle: shouldHideTabBar ? { display: "none" } : undefined,
                    };
                }}
            />
        </Tabs>
    );
}
