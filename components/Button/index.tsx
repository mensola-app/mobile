import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

import { styles } from "./styles";
import { IButtonProps } from "./types";
import { Colors } from "@/constants/colors";

export default function Button({
    label,
    onPress,
    style,
    labelStyle,
    loading,
    isLoading,
    disabled,
    indicatorColor = Colors.textPrimary,
    ...restProps
}: IButtonProps) {
    const isBusy = Boolean(loading || isLoading);
    const isDisabled = Boolean(disabled || isBusy);

    return (
        <TouchableOpacity
            style={[styles.button, isDisabled && styles.disabled, style]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            accessibilityState={{ busy: isBusy, disabled: isDisabled }}
            {...restProps}>
            {isBusy ? (
                <ActivityIndicator size="small" color={indicatorColor} />
            ) : (
                <Text style={[styles.label, labelStyle]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}
