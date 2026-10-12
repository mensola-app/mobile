import React, { useContext, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Keyboard,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

import { styles } from "./styles";
import { IBottomSheetProps } from "./types";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DEFAULT_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };
const MAX_HEIGHT_RATIO = 0.9;
const TOP_GAP = 24;

export default function BottomSheet({
    isVisible,
    onClose,
    title,
    children,
    showCloseButton = true,
    height,
    containerStyle,
    contentStyle,
    titleStyle,
    testID = "bottom-sheet",
    scrollable = true,
}: IBottomSheetProps) {
    const [modalVisible, setModalVisible] = useState(isVisible);
    const [keyboardPadding, setKeyboardPadding] = useState(0);
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    // Context okunuyor (hook değil) ki SafeAreaProvider olmayan ortamlarda (testler) da çalışsın
    const insets = useContext(SafeAreaInsetsContext) ?? DEFAULT_INSETS;
    const { height: windowHeight } = useWindowDimensions();

    const isKeyboardOpen = keyboardPadding > 0;
    const maxSheetHeight = Math.min(
        windowHeight * MAX_HEIGHT_RATIO,
        windowHeight - keyboardPadding - insets.top - TOP_GAP,
    );
    const bottomPadding = isKeyboardOpen ? 16 : Math.max(insets.bottom, 12) + 16;

    // Klavye listener'ı: Klavye açıldığında yüksekliği alıp padding ekler
    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSubscription = Keyboard.addListener(showEvent, (e) => {
            setKeyboardPadding(e.endCoordinates.height);
        });
        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardPadding(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (isVisible) {
            setModalVisible(true);
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setModalVisible(false);
                setKeyboardPadding(0);
            });
        }
    }, [isVisible, translateY, backdropOpacity]);

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setModalVisible(false);
            setKeyboardPadding(0);
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 120 || gestureState.vy > 0.5) {
                    handleClose();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 4,
                    }).start();
                }
            },
        }),
    ).current;

    if (!modalVisible) return null;

    return (
        <Modal transparent visible={modalVisible} onRequestClose={handleClose} animationType="none" testID={testID}>
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity, paddingBottom: keyboardPadding }]}>
                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                        Keyboard.dismiss();
                        handleClose();
                    }}
                    testID={`${testID}-backdrop`}
                />
                <Animated.View
                    style={[
                        styles.sheetContainer,
                        { maxHeight: maxSheetHeight, paddingBottom: bottomPadding },
                        height ? { height: Math.min(height, maxSheetHeight) } : undefined,
                        containerStyle,
                        { transform: [{ translateY }] },
                    ]}>
                    <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
                        <View style={styles.dragHandle} />
                    </View>

                    {(title || showCloseButton) && (
                        <View style={styles.header}>
                            {title ? <Text style={[styles.title, titleStyle]}>{title}</Text> : <View />}
                            {showCloseButton && (
                                <TouchableOpacity
                                    onPress={handleClose}
                                    style={styles.closeButton}
                                    activeOpacity={0.7}
                                    testID={`${testID}-close-button`}>
                                    <Ionicons name="close" size={24} color="#A7A7A7" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {scrollable ? (
                        <ScrollView
                            style={styles.scrollArea}
                            contentContainerStyle={[styles.content, contentStyle]}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                            testID={`${testID}-scroll`}>
                            {children}
                        </ScrollView>
                    ) : (
                        <View style={[styles.content, styles.staticArea, contentStyle]}>{children}</View>
                    )}
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}
