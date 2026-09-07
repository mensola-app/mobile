import { Text, TextInput } from "react-native";

import { styles } from "./styles";
import { ITextFieldProps, TextFieldType } from "./types";
import { Colors } from "@/constants/colors";
import { useState } from "react";

const typePresets: Record<TextFieldType, Partial<ITextFieldProps>> = {
    text: {},
    email: { keyboardType: "email-address" },
    password: { secureTextEntry: true },
    number: { keyboardType: "number-pad" },
};

export default function TextField({ label, type = "text", error, style, ...rest }: ITextFieldProps) {
    const presetProps = typePresets[type];
    const [isFocused, setIsFocused] = useState(false);

    return (
        <>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.textField,
                    isFocused && { borderColor: Colors.primary },
                    Boolean(error) && { borderColor: Colors.danger },
                    rest.editable === false && { opacity: 0.7 },
                    style,
                ]}
                placeholderTextColor={Colors.textMuted}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
                {...presetProps}
                {...rest}
            />
        </>
    );
}
