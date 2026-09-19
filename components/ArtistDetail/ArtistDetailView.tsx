import { useState } from "react";
import {
    View,
    Text,
    Image,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import ActionButton from "@/components/Movies/ActionButton";
import DynamicList from "@/components/DynamicList";
import MusicCard from "@/components/MusicCard";
import { ArtistAlbumItem } from "@/types/artist.types";
import { shareArtist } from "@/utils/share";
import { styles } from "./styles";
import { IArtistDetailViewProps } from "./types";
import { Colors } from "@/constants/colors";

const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default function ArtistDetailView({
    artistDetails,
    isLoading,
    isRefreshing: propIsRefreshing,
    error,
    isFollowLoading,
    onToggleFollow,
    onRefetch,
}: IArtistDetailViewProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const onRefresh = async () => {
        if (!onRefetch) return;
        setRefreshing(true);
        try {
            await onRefetch();
        } finally {
            setRefreshing(false);
        }
    };

    const handleShare = async () => {
        if (!artistDetails) return;
        await shareArtist({
            id: artistDetails.spotifyId || artistDetails.id,
            name: artistDetails.name,
        });
    };

    const handleOpenSpotify = () => {
        if (artistDetails?.spotifyId) {
            Linking.openURL(`https://open.spotify.com/artist/${artistDetails.spotifyId}`).catch((err) => {
                console.error("Failed to open Spotify artist:", err);
            });
        }
    };

    if (isLoading && !artistDetails) {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }

    if (error && !artistDetails) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{t("common.error")}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={onRefetch}>
                    <Text style={styles.retryText}>{t("common.retry")}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!artistDetails) return null;

    const followerCount = artistDetails.followerCount || 0;
    const followersText = `${Intl.NumberFormat("tr-TR").format(followerCount)} ${t("artist.followers", { defaultValue: "takipçi" })}`;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                onRefetch ? (
                    <RefreshControl
                        refreshing={propIsRefreshing !== undefined ? propIsRefreshing : refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                ) : undefined
            }
        >
            {/* Hero Section */}
            <View style={styles.heroBanner}>
                {artistDetails.image ? (
                    <ImageBackground
                        style={styles.bannerBackgroundImg}
                        source={{ uri: artistDetails.image }}
                    >
                        <LinearGradient
                            colors={["transparent", "rgba(8, 12, 18, 0.8)", Colors.background]}
                            style={styles.bannerGradient}
                        />
                    </ImageBackground>
                ) : (
                    <View style={[styles.bannerBackgroundImg, { backgroundColor: Colors.surface }]}>
                        <LinearGradient
                            colors={["transparent", "rgba(8, 12, 18, 0.8)", Colors.background]}
                            style={styles.bannerGradient}
                        />
                    </View>
                )}

                <View style={styles.bannerContent}>
                    <View style={styles.posterWrapper}>
                        {artistDetails.image ? (
                            <Image
                                source={{ uri: artistDetails.image }}
                                style={styles.poster}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.poster, styles.posterPlaceholder]}>
                                <Ionicons name="person" size={44} color={Colors.textSecondary} />
                            </View>
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.titleWrapper}>
                            <Text style={styles.artistName} numberOfLines={2}>
                                {artistDetails.name}
                            </Text>
                        </View>

                        <View style={styles.metaWrapper}>
                            <Text style={styles.followersText}>{followersText}</Text>
                            {artistDetails.genres && artistDetails.genres.length > 0 && (
                                <>
                                    <Text style={styles.dot}>•</Text>
                                    <Text style={styles.genresText} numberOfLines={1}>
                                        {artistDetails.genres.slice(0, 2).join(", ")}
                                    </Text>
                                </>
                            )}
                        </View>

                        <View style={styles.actionBar}>
                            <TouchableOpacity
                                style={[
                                    styles.followButton,
                                    artistDetails.isFollowing ? styles.followButtonInactive : styles.followButtonActive,
                                ]}
                                onPress={onToggleFollow}
                                disabled={isFollowLoading}
                                activeOpacity={0.7}
                            >
                                {isFollowLoading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={artistDetails.isFollowing ? Colors.textPrimary : "#FFFFFF"}
                                    />
                                ) : (
                                    <Text
                                        style={[
                                            styles.followButtonText,
                                            artistDetails.isFollowing
                                                ? styles.followButtonTextInactive
                                                : styles.followButtonTextActive,
                                        ]}
                                    >
                                        {artistDetails.isFollowing
                                            ? t("artist.following", { defaultValue: "Takip Ediliyor" })
                                            : t("artist.follow", { defaultValue: "Takip Et" })}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <ActionButton
                                iconComponent={<FontAwesome name="spotify" size={20} color="#1DB954" />}
                                isActive={false}
                                activeColor="rgba(29, 185, 84, 0.2)"
                                onPress={handleOpenSpotify}
                                disabled={!artistDetails.spotifyId}
                                testID="artist-spotify-button"
                            />

                            <ActionButton
                                icon="share-social-outline"
                                isActive={false}
                                activeColor={`${Colors.primary}66`}
                                onPress={handleShare}
                                testID="artist-share-button"
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* Top Tracks Section */}
            {artistDetails.topTracks && artistDetails.topTracks.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>
                        {t("artist.topTracks", { defaultValue: "Popüler Şarkılar" })}
                    </Text>
                    {artistDetails.topTracks.map((track, index) => (
                        <TouchableOpacity
                            key={track.spotifyId}
                            style={styles.trackItem}
                            activeOpacity={0.7}
                            onPress={() => router.push(`/tracks/${track.spotifyId}?type=spotify`)}
                        >
                            <Text style={styles.trackIndexText}>{index + 1}</Text>
                            {track.image ? (
                                <Image source={{ uri: track.image }} style={styles.trackImage} resizeMode="cover" />
                            ) : (
                                <View style={styles.trackImage} />
                            )}
                            <View style={styles.trackInfo}>
                                <Text style={styles.trackTitle} numberOfLines={1}>
                                    {track.title}
                                </Text>
                                <Text style={styles.trackDuration}>{formatDuration(track.duration)}</Text>
                            </View>
                            <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Albums (Discography) Section */}
            {artistDetails.albums && artistDetails.albums.length > 0 && (
                <View style={{ marginTop: 8 }}>
                    <DynamicList<ArtistAlbumItem>
                        title={t("artist.discography", { defaultValue: "Diskografi" })}
                        data={artistDetails.albums}
                        variant="horizontal"
                        onSeeAllPress={() =>
                            router.push(`/artists/${artistDetails.spotifyId || artistDetails.id}/discography`)
                        }
                        renderItem={({ item }) => (
                            <MusicCard
                                type="album"
                                layout="vertical"
                                data={{
                                    spotifyId: (item.spotifyId || item.id) as any,
                                    title: item.title || item.name,
                                    image: item.image || item.images?.[0]?.url,
                                    releaseYear: item.releaseYear,
                                    artists: (item.artists || [{ name: artistDetails.name }]) as any,
                                }}
                                onPress={() => router.push(`/albums/${item.spotifyId || item.id}?type=spotify`)}
                            />
                        )}
                    />
                </View>
            )}
        </ScrollView>
    );
}
