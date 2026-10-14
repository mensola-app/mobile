import React from "react";
import { View, Text, Image, ScrollView, Linking } from "react-native";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";

import { ListGroup, ListGroupItem } from "@/components/ListGroup";
import { Colors } from "@/constants/colors";
import { LINKS } from "@/constants/links";
import { styles } from "./styles";

export default function AboutView() {
    const { t } = useTranslation();

    const version = Constants.expoConfig?.version || "1.0.0";

    const handleOpenUrl = (url: string) => {
        Linking.openURL(url).catch((err) => {
            console.error("Failed to open URL:", err);
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero / Header */}
            <View style={styles.heroContainer}>
                <Image
                    source={require("@/assets/images/icon.png")}
                    style={styles.appIcon}
                    resizeMode="cover"
                />
                <Text style={styles.appName}>mensola</Text>
                <Text style={styles.appVersion}>
                    {t("settings.about.version", { version })}
                </Text>
            </View>

            {/* Legal Group */}
            <ListGroup title={t("settings.about.legalTitle")}>
                <ListGroupItem
                    isFirst
                    onPress={() => handleOpenUrl(LINKS.PRIVACY_POLICY)}
                    testID="about-privacy-policy">
                    <View style={styles.itemLeft}>
                        <Text style={styles.itemTitle}>{t("settings.about.privacyPolicy")}</Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color={Colors.textMuted} />
                </ListGroupItem>

                <ListGroupItem
                    isLast
                    onPress={() => handleOpenUrl(LINKS.TERMS)}
                    testID="about-terms-of-service">
                    <View style={styles.itemLeft}>
                        <Text style={styles.itemTitle}>{t("settings.about.termsOfService")}</Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color={Colors.textMuted} />
                </ListGroupItem>
            </ListGroup>

            {/* Data & Attributions Group */}
            <ListGroup title={t("settings.about.attributionsTitle")}>
                <ListGroupItem
                    isFirst
                    onPress={() => handleOpenUrl(LINKS.TMDB)}
                    testID="about-tmdb">
                    <View style={styles.itemLeft}>
                        <Text style={styles.itemTitle}>{t("settings.about.tmdbTitle")}</Text>
                        <Text style={styles.itemSubtitle}>{t("settings.about.tmdbDesc")}</Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color={Colors.textMuted} />
                </ListGroupItem>

                <ListGroupItem
                    isLast
                    onPress={() => handleOpenUrl(LINKS.SPOTIFY_WEB)}
                    testID="about-spotify">
                    <View style={styles.itemLeft}>
                        <Text style={styles.itemTitle}>{t("settings.about.spotifyTitle")}</Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color={Colors.textMuted} />
                </ListGroupItem>
            </ListGroup>

            {/* Community & Social Group */}
            <ListGroup title={t("settings.about.communityTitle")}>
                <ListGroupItem
                    isFirst
                    onPress={() => handleOpenUrl(LINKS.SOCIAL_X)}
                    testID="about-social-x">
                    <View style={styles.itemWithIconLeft}>
                        <FontAwesome6 name="x-twitter" size={17} color={Colors.textPrimary} style={styles.socialIcon} />
                        <Text style={styles.itemTitle}>{t("settings.about.followTwitter")}</Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color={Colors.textMuted} />
                </ListGroupItem>

                <ListGroupItem
                    isLast
                    onPress={() => handleOpenUrl(LINKS.SOCIAL_INSTAGRAM)}
                    testID="about-social-instagram">
                    <View style={styles.itemWithIconLeft}>
                        <Ionicons name="logo-instagram" size={18} color={Colors.textPrimary} style={styles.socialIcon} />
                        <Text style={styles.itemTitle}>{t("settings.about.followInstagram")}</Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color={Colors.textMuted} />
                </ListGroupItem>
            </ListGroup>

            {/* Footer */}
            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>
                    {t("settings.about.craftedBy")}{" "}
                    <Text
                        style={styles.developerLink}
                        onPress={() => handleOpenUrl(LINKS.DEVELOPER_PROFILE)}
                        testID="about-developer-link">
                        Enes Can
                    </Text>
                </Text>
                <Text style={styles.copyrightText}>{t("settings.about.copyright")}</Text>
            </View>
        </ScrollView>
    );
}
