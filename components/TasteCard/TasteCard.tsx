import React, { forwardRef } from "react";
import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import Avatar from "@/components/Avatar";
import MovieCard from "@/components/MovieCard";
import MusicCard from "@/components/MusicCard";
import { Colors } from "@/constants/colors";
import { styles } from "./styles";
import { ITasteCardProps } from "./types";
import { IUser } from "@/types/user.types";

export const TasteCard = forwardRef<View, Omit<ITasteCardProps, "cardRef">>(
    ({ user, favoriteMovies, favoriteTracks, squareCorners }, ref) => {
        const { t } = useTranslation();

        return (
            <View
                ref={ref}
                collapsable={false}
                style={[styles.cardContainer, squareCorners && styles.squareCardContainer]}>
                <LinearGradient
                    colors={["#141D2F", "#0E1524", "#090D16"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={styles.cardGradient}>
                    {/* Header: User Info & App Branding */}
                    <View style={styles.headerBlock}>
                        <View style={styles.cardHeader}>
                            <View style={styles.userSection}>
                                <View style={styles.avatarBorder}>
                                    <Avatar
                                        url={user?.avatar}
                                        name={user?.fullname || user?.username}
                                        user={user && user.id && user.username ? (user as IUser) : undefined}
                                        size={38}
                                    />
                                </View>
                                <View style={styles.userTextContainer}>
                                    {user?.fullname ? (
                                        <Text style={styles.userFullname} numberOfLines={1}>
                                            {user.fullname}
                                        </Text>
                                    ) : null}
                                    <Text style={styles.userHandle} numberOfLines={1}>
                                        @{user?.username || "user"}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.appSection}>
                                <Image
                                    source={require("@/assets/images/icon.png")}
                                    style={styles.appIcon}
                                    resizeMode="cover"
                                />
                                <Text style={styles.appName}>mensola</Text>
                            </View>
                        </View>

                        <View style={styles.headerDivider} />
                    </View>

                    {/* Movies Section: Clean posters using MovieCard */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIconBadge, { backgroundColor: "rgba(99, 102, 241, 0.15)" }]}>
                                <Ionicons name="film" size={13} color={Colors.primary} />
                            </View>
                            <Text style={styles.sectionTitle}>
                                {t("profile.tasteCard.movies", { defaultValue: "Favori Filmler" })}
                            </Text>
                        </View>
                        <View style={styles.itemsGrid}>
                            {favoriteMovies.slice(0, 3).map((movie, index) => (
                                <MovieCard
                                    key={movie.id || `movie-${index}`}
                                    title={movie.title}
                                    poster={movie.poster}
                                    variant="profile"
                                    style={styles.gridItem}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Tracks Section: Using MusicCard */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIconBadge, { backgroundColor: "rgba(236, 72, 153, 0.15)" }]}>
                                <Ionicons name="musical-notes" size={13} color={Colors.secondary} />
                            </View>
                            <Text style={styles.sectionTitle}>
                                {t("profile.tasteCard.tracks", { defaultValue: "Favori Şarkılar" })}
                            </Text>
                        </View>
                        <View style={styles.itemsGrid}>
                            {favoriteTracks.slice(0, 3).map((track, index) => (
                                <MusicCard
                                    key={track.id || `track-${index}`}
                                    type="track"
                                    data={track}
                                    compact
                                    style={styles.gridItem}
                                />
                            ))}
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    }
);

TasteCard.displayName = "TasteCard";
export default TasteCard;
