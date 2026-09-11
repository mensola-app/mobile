import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { getLocales } from "expo-localization";

import { ListGroup } from "../ListGroup";
import BottomSheet from "../BottomSheet";
import SettingsItem from "./SettingsItem";
import { SettingSection, OptionsSetting } from "./types";
import { styles } from "./styles";
import { Colors } from "@/constants/colors";
import { usePreferences } from "@/hooks/usePreferences";
import { useGlobalUser } from "@/context/AuthContext";
import { UserService } from "@/services/user.service";
import { useTranslation } from "react-i18next";

const getSettingsConfig = (t: any): SettingSection[] => [
    {
        id: "account",
        title: t("settings.menu.account.title"),
        items: [
            {
                id: "update-username",
                type: "route",
                label: t("settings.menu.account.update-username"),
                route: "/settings/account/update-username",
                value: "enescxx",
            },
            {
                id: "update-email",
                type: "route",
                label: t("settings.menu.account.update-email"),
                route: "/settings/account/update-email",
                value: "enescx54@gmail.com",
            },
            {
                id: "update-password",
                type: "route",
                label: t("settings.menu.account.update-password"),
                route: "/settings/account/update-password",
            },
        ],
    },
    {
        id: "preferences",
        title: t("settings.menu.preferences.title"),
        items: [
            {
                id: "theme",
                type: "options",
                label: t("settings.menu.preferences.theme"),
                value: "dark",
                disabled: true,
                options: [
                    { label: t("settings.menu.preferences.theme-options.dark"), value: "dark" },
                    { label: t("settings.menu.preferences.theme-options.light"), value: "light" },
                    { label: t("settings.menu.preferences.theme-options.system"), value: "system" },
                ],
            },
            {
                id: "language",
                type: "options",
                label: t("settings.menu.preferences.language"),
                value: "system",
                options: [
                    { label: t("settings.menu.preferences.language-options.system"), value: "system" },
                    { label: t("settings.menu.preferences.language-options.en"), value: "en" },
                    { label: t("settings.menu.preferences.language-options.tr"), value: "tr" },
                ],
            },
            {
                id: "default-tab",
                type: "options",
                label: t("settings.menu.preferences.default-tab"),
                description: t("settings.menu.preferences.default-tab-desc"),
                value: "movies",
                options: [
                    { label: t("settings.menu.preferences.default-tab-options.movies"), value: "movies" },
                    { label: t("settings.menu.preferences.default-tab-options.tracks"), value: "tracks" },
                ],
            },
            {
                id: "shelf-layout",
                type: "options",
                label: t("settings.menu.preferences.shelf-layout"),
                description: t("settings.menu.preferences.shelf-layout-desc"),
                value: "grid",
                disabled: true,
                options: [
                    { label: t("settings.menu.preferences.shelf-layout-options.grid"), value: "grid" },
                    { label: t("settings.menu.preferences.shelf-layout-options.list"), value: "list" },
                ],
            },
        ],
    },
    {
        id: "privacy",
        title: t("settings.menu.privacy.title"),
        items: [
            {
                id: "is-private",
                type: "toggle",
                label: t("settings.menu.privacy.is-private"),
                description: t("settings.menu.privacy.is-private-desc"),
                value: false,
            },
        ],
    },
    {
        id: "about",
        title: t("settings.menu.about.title"),
        items: [
            {
                id: "about-mensola",
                type: "route",
                label: t("settings.menu.about.aboutMensola"),
                description: t("settings.menu.about.aboutMensolaDesc"),
                route: "/settings/about",
            },
        ],
    },
    {
        id: "data-danger-zone",
        title: t("settings.menu.data-danger-zone.title"),
        items: [
            {
                id: "logout",
                type: "action",
                label: t("settings.menu.data-danger-zone.logout"),
                description: t("settings.menu.data-danger-zone.logout-desc"),
                actionKey: "LOGOUT",
                variant: "default",
            },
            {
                id: "delete-account",
                type: "action",
                label: t("settings.menu.data-danger-zone.delete-account"),
                description: t("settings.menu.data-danger-zone.delete-account-desc"),
                actionKey: "DELETE_USER_ACCOUNT",
                variant: "danger",
            },
        ],
    },
];

export default function SettingsView() {
    const theme = usePreferences((state) => state.theme);
    const language = usePreferences((state) => state.language);
    const defaultTab = usePreferences((state) => state["default-tab"]);
    const shelfLayout = usePreferences((state) => state["shelf-layout"]);
    const setPreference = usePreferences((state) => state.setPreference);

    const { user, setUser, logout } = useGlobalUser();
    const router = useRouter();

    const { t, i18n } = useTranslation();
    const [activeOptionsSetting, setActiveOptionsSetting] = useState<OptionsSetting | null>(null);
    const [isSheetVisible, setIsSheetVisible] = useState(false);

    // Compute sections configurations dynamically using state, global user, and Zustand store values
    const sections: SettingSection[] = getSettingsConfig(t).map((section) => {
        if (section.id === "account") {
            return {
                ...section,
                items: section.items.map((item) => {
                    if (item.id === "update-username" && item.type === "route") {
                        return { ...item, value: user?.username };
                    }
                    if (item.id === "update-email" && item.type === "route") {
                        return { ...item, value: user?.email };
                    }
                    return item;
                }),
            };
        }
        if (section.id === "preferences") {
            return {
                ...section,
                items: section.items.map((item) => {
                    if (item.id === "theme" && item.type === "options") {
                        return { ...item, value: theme };
                    }
                    if (item.id === "language" && item.type === "options") {
                        return { ...item, value: language };
                    }
                    if (item.id === "default-tab" && item.type === "options") {
                        return { ...item, value: defaultTab };
                    }
                    if (item.id === "shelf-layout" && item.type === "options") {
                        return { ...item, value: shelfLayout };
                    }
                    return item;
                }),
            };
        }
        if (section.id === "privacy") {
            return {
                ...section,
                items: section.items.map((item) => {
                    if (item.id === "is-private" && item.type === "toggle") {
                        return { ...item, value: !!user?.isPrivate };
                    }
                    return item;
                }),
            };
        }
        return section;
    });

    const handleToggleChange = async (itemId: string, newValue: boolean) => {
        if (itemId === "is-private") {
            if (!user) return;

            // Optimistic update
            setUser({ ...user, isPrivate: newValue });

            try {
                await UserService.updatePrivacy(newValue);
            } catch (error) {
                // Revert state on failure
                setUser({ ...user, isPrivate: !newValue });

                Alert.alert(
                    t("common.error"),
                    t("settings.alerts.privacyUpdate.error")
                );
            }
        } else {
            setPreference(itemId as any, newValue);
        }
    };

    const handleOptionSelect = (itemId: string, newValue: string) => {
        setPreference(itemId as any, newValue);
        if (itemId === "language") {
            const deviceLanguage = getLocales()[0]?.languageCode ?? "en";
            const langToSet = newValue === "system" ? deviceLanguage : newValue;
            i18n.changeLanguage(langToSet);
        }
    };

    const handleOptionPress = (item: OptionsSetting) => {
        // Find current dynamic settings value from computed sections
        let currentItem: OptionsSetting | undefined;
        for (const section of sections) {
            const found = section.items.find((i) => i.id === item.id);
            if (found && found.type === "options") {
                currentItem = found;
                break;
            }
        }
        setActiveOptionsSetting(currentItem || item);
        setIsSheetVisible(true);
    };

    const handleActionPress = (actionKey: string) => {
        if (actionKey === "EXPORT_USER_DATA") {
            Alert.alert(
                t("settings.alerts.exportData.title"),
                t("settings.alerts.exportData.body"),
                [
                    { text: t("common.cancel"), style: "cancel" },
                    {
                        text: t("common.ok"),
                        onPress: () => {
                            Alert.alert(t("common.success"), t("settings.alerts.exportData.success"));
                        },
                    },
                ]
            );
        } else if (actionKey === "LOGOUT") {
            Alert.alert(
                t("settings.alerts.logout.title"),
                t("settings.alerts.logout.body"),
                [
                    { text: t("common.cancel"), style: "cancel" },
                    {
                        text: t("settings.alerts.logout.button"),
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await logout();
                            } catch (e) {
                                console.error("Error signing out:", e);
                            }
                        },
                    },
                ]
            );
        } else if (actionKey === "DELETE_USER_ACCOUNT") {
            Alert.alert(
                t("settings.alerts.deleteAccount.title"),
                t("settings.alerts.deleteAccount.body"),
                [
                    { text: t("common.cancel"), style: "cancel" },
                    {
                        text: t("settings.alerts.deleteAccount.button"),
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await UserService.deleteAccount();
                                await logout();
                            } catch (e) {
                                console.error("Error deleting account:", e);
                                Alert.alert(t("common.error"), t("settings.alerts.deleteAccount.error"));
                            }
                        },
                    },
                ]
            );
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                {sections.map((section) => (
                    <ListGroup key={section.id} title={section.title}>
                        {section.items.map((item, index) => {
                            const isFirst = index === 0;
                            const isLast = index === section.items.length - 1;
                            return (
                                <SettingsItem
                                    key={item.id}
                                    item={item}
                                    isFirst={isFirst}
                                    isLast={isLast}
                                    onToggle={handleToggleChange}
                                    onOptionPress={handleOptionPress}
                                    onActionPress={handleActionPress}
                                />
                            );
                        })}
                    </ListGroup>
                ))}
            </ScrollView>

            <BottomSheet
                isVisible={isSheetVisible}
                onClose={() => setIsSheetVisible(false)}
                title={activeOptionsSetting?.label || "Select Option"}
                showCloseButton
            >
                {activeOptionsSetting && (
                    <View style={styles.sheetOptionList}>
                        {activeOptionsSetting.options.map((option, index) => {
                            const isSelected = activeOptionsSetting.value === option.value;
                            const isLast = index === activeOptionsSetting.options.length - 1;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[styles.sheetOptionItem, isLast && styles.sheetOptionItemLast]}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        handleOptionSelect(activeOptionsSetting.id, option.value);
                                        setIsSheetVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.sheetOptionText,
                                            isSelected && styles.sheetOptionTextActive,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {isSelected && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </BottomSheet>
        </View>
    );
}
