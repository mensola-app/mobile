import React from "react";
import { FlatListProps, StyleProp, ViewStyle } from "react-native";

export interface IDynamicListProps<T> extends Partial<FlatListProps<T>> {
    title?: string;
    data: T[];
    renderItem: ({ item }: { item: T }) => React.ReactElement;
    onSeeAllPress?: () => void;
    seeAllText?: string;
    variant?: "horizontal" | "vertical";
    ItemSeparatorComponent?: React.ComponentType<any> | null;
    style?: StyleProp<ViewStyle>;
}
