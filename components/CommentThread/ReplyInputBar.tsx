import React, { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { threadStyles as styles } from "./styles";
import { ReplyTarget } from "./types";

interface ReplyInputBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onCancelReply: () => void;
    replyTarget: ReplyTarget;
    isSending?: boolean;
}

export default function ReplyInputBar({
    value,
    onChangeText,
    onSend,
    onCancelReply,
    replyTarget,
    isSending,
}: ReplyInputBarProps) {
    const { t } = useTranslation();
    let insets = { top: 0, bottom: 0, left: 0, right: 0 };
    try {
        insets = useSafeAreaInsets();
    } catch {
        // Fallback for tests or environments outside SafeAreaProvider
    }
    const inputRef = useRef<TextInput>(null);
    const [keyboardPadding, setKeyboardPadding] = useState(0);

    const savedBottomInset = useRef(insets.bottom);
    useEffect(() => {
        if (insets.bottom > 0) {
            savedBottomInset.current = insets.bottom;
        }
    }, [insets.bottom]);

    const defaultBottom = insets.bottom > 0 ? insets.bottom + 6 : 12;
    const animatedBottom = useRef(new Animated.Value(defaultBottom)).current;

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSubscription = Keyboard.addListener(showEvent, (e) => {
            const keyboardHeight = e.endCoordinates.height;
            setKeyboardPadding(keyboardHeight);
            // Android'de klavye yüksekliği sistem navigasyon çubuğunu (gesture/3-button) hariç tutabildiği için
            // ekran tabanından hesaplanan pozisyona navigasyon bar payı eklenir
            const androidNavOffset =
                Platform.OS === "android" ? (savedBottomInset.current > 0 ? savedBottomInset.current + 4 : 28) : 0;
            const targetOffset = keyboardHeight + androidNavOffset + 8;
            if (Platform.OS === "ios" && e.duration) {
                Animated.timing(animatedBottom, {
                    toValue: targetOffset,
                    duration: e.duration,
                    useNativeDriver: false,
                }).start();
            } else {
                animatedBottom.setValue(targetOffset);
            }
        });

        const hideSubscription = Keyboard.addListener(hideEvent, (e) => {
            setKeyboardPadding(0);
            const targetOffset = insets.bottom > 0 ? insets.bottom + 6 : 12;
            if (Platform.OS === "ios" && e?.duration) {
                Animated.timing(animatedBottom, {
                    toValue: targetOffset,
                    duration: e.duration,
                    useNativeDriver: false,
                }).start();
            } else {
                animatedBottom.setValue(targetOffset);
            }
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [insets.bottom, animatedBottom]);

    useEffect(() => {
        if (keyboardPadding === 0) {
            animatedBottom.setValue(insets.bottom > 0 ? insets.bottom + 6 : 12);
        }
    }, [insets.bottom, keyboardPadding, animatedBottom]);

    const canSend = value.trim().length > 0 && !isSending;

    return (
        <Animated.View style={[styles.inputWrapper, { bottom: animatedBottom }]}>
            <View style={styles.inputCard}>
                {/* Replying-to indicator */}
                {replyTarget ? (
                    <View style={styles.replyingToBar}>
                        <View style={styles.replyingToLeft}>
                            <Ionicons name="arrow-undo" size={13} color={Colors.primary} />
                            <Text style={styles.replyingToText} numberOfLines={1}>
                                {t("comments.replyingTo", { username: replyTarget.username })}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onCancelReply} activeOpacity={0.7} hitSlop={8}>
                            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Input row */}
                <View style={styles.inputRow}>
                    <TextInput
                        ref={inputRef}
                        style={styles.textInput}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={
                            replyTarget
                                ? t("comments.replyPlaceholder", { username: replyTarget.username })
                                : t("comments.inputPlaceholder", "Bir şeyler yaz...")
                        }
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        maxLength={2000}
                        returnKeyType="default"
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
                        activeOpacity={0.8}
                        onPress={canSend ? onSend : undefined}
                        disabled={!canSend}>
                        <Ionicons
                            name={isSending ? "hourglass-outline" : "arrow-up"}
                            size={18}
                            color={canSend ? "#fff" : Colors.textMuted}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}
