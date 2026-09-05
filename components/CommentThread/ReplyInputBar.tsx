import React, { useRef } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
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
    const inputRef = useRef<TextInput>(null);

    const canSend = value.trim().length > 0 && !isSending;

    return (
        <KeyboardAvoidingView
            style={styles.inputWrapper}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
            {/* Replying-to indicator */}
            {replyTarget ? (
                <View style={styles.replyingToBar}>
                    <Text style={styles.replyingToText}>
                        {t("comments.replyingTo", { username: replyTarget.username })}
                    </Text>
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
        </KeyboardAvoidingView>
    );
}
