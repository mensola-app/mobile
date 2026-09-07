import { StyleProp, ViewStyle, TextStyle, TouchableOpacityProps } from "react-native";

export interface IButtonProps extends Partial<TouchableOpacityProps> {
    label: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    loading?: boolean;
    isLoading?: boolean;
    indicatorColor?: string;
}
