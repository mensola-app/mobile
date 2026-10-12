import { ReactNode } from "react";
import { StyleProp, ViewStyle, TextStyle } from "react-native";

export interface IBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    title?: string;
    children?: ReactNode;
    showCloseButton?: boolean;
    height?: number;
    containerStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    testID?: string;
    /**
     * Wraps children in a ScrollView so long content stays reachable on small screens.
     * Set to false when children already render their own FlatList/ScrollView.
     * @default true
     */
    scrollable?: boolean;
}
