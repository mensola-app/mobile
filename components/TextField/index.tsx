import { forwardRef, useState } from "react";
import { Text, TextInput } from "react-native";

import { styles } from "./styles";
import { ITextFieldProps, TextFieldType } from "./types";
import { Colors } from "@/constants/colors";

const typePresets: Record<TextFieldType, Partial<ITextFieldProps>> = {
    text: {},
    email: { keyboardType: "email-address" },
    password: { secureTextEntry: true },
    number: { keyboardType: "number-pad" },
};

const TextField = forwardRef<TextInput, ITextFieldProps>(function TextField(
    { label, type = "text", error, style, ...rest },
    ref
) {
    const presetProps = typePresets[type];
    const [isFocused, setIsFocused] = useState(false);

    return (
        <>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                ref={ref}
                style={[
                    styles.textField,
                    isFocused && { borderColor: Colors.primary },
                    Boolean(error) && { borderColor: Colors.danger },
                    rest.editable === false && { opacity: 0.7 },
                    style,
                ]}
                placeholderTextColor={Colors.textMuted}
                onFocus={(e) => {
                    setIsFocused(true);
                    rest.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    rest.onBlur?.(e);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                {...presetProps}
                {...rest}
            />
        </>
    );
});

export default TextField;
