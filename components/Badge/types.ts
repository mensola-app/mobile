import { ReactNode } from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";

export interface IBadgeProps {
    icon?: ReactNode;
    value?: number | string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}
