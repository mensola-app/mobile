import { View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

import { TABS_CONFIG } from "../../constants/tabs";
import TabBarItem from "./TabBarItem";
import { styles } from "./styles";

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    const focusedRoute = state.routes[state.index];
    const focusedDescriptor = descriptors ? descriptors[focusedRoute.key] : undefined;
    const focusedOptions = focusedDescriptor?.options;

    const childRouteName = getFocusedRouteNameFromRoute(focusedRoute);
    if (
        childRouteName === "[statType]" ||
        (focusedOptions?.tabBarStyle && (focusedOptions.tabBarStyle as any).display === "none")
    ) {
        return null;
    }

    const dynamicBottomSpace = insets.bottom > 0 ? insets.bottom + 12 : 24;

    return (
        <View style={[styles.tabBarContainer, { bottom: dynamicBottomSpace }]}>
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const options = descriptors ? descriptors[route.key]?.options : undefined;
                const hasBadge = Boolean(options?.tabBarBadge);

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TabBarItem
                        key={route.key}
                        routeName={route.name as keyof typeof TABS_CONFIG}
                        onPress={onPress}
                        isFocused={isFocused}
                        hasBadge={hasBadge}
                    />
                );
            })}
        </View>
    );
}
