import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TABS_CONFIG } from "../../constants/tabs";
import TabBarItem from "./TabBarItem";
import { styles } from "./styles";

interface TabBarProps {
    state: {
        index: number;
        routes: Array<{
            key: string;
            name: string;
            state?: any;
            params?: any;
        }>;
    };
    descriptors?: Record<string, {
        options?: {
            tabBarBadge?: any;
            tabBarStyle?: any;
            [key: string]: any;
        };
    }>;
    navigation: {
        emit: (event: any) => any;
        navigate: (name: string) => void;
    };
}

function getActiveChildRoute(route: any): any {
    if (!route) return undefined;
    if (route.state) {
        const state = route.state;
        const index = typeof state.index === "number" ? state.index : (state.routes?.length ?? 1) - 1;
        const child = state.routes?.[index];
        return child ? (getActiveChildRoute(child) ?? child) : route;
    }
    return route;
}

export default function TabBar({ state, descriptors, navigation }: TabBarProps) {
    const insets = useSafeAreaInsets();

    const focusedRoute = state.routes[state.index];
    const focusedDescriptor = descriptors ? descriptors[focusedRoute.key] : undefined;
    const focusedOptions = focusedDescriptor?.options;

    const activeChild = getActiveChildRoute(focusedRoute);
    const childRouteName = activeChild?.name;
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
