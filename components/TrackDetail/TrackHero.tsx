import { useState } from "react";
import {
    View,
    Text,
    Image,
    ImageBackground,
    TouchableOpacity,
    NativeSyntheticEvent,
    TextLayoutEventData,
    Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";

import ActionButton from "@/components/Movies/ActionButton";
import Badge from "@/components/Badge";
import { styles } from "./styles";
import { ITrackHeroProps } from "./types";
import { Colors } from "@/constants/colors";

export default function TrackHero({
    trackDetails,
    toggleLike,
    onCommentPress,
    onAddPress,
    onPlayPress,
    commentsCount: propCommentsCount,
}: ITrackHeroProps) {
    if (!trackDetails) return null;

    const artistName = trackDetails.artists && trackDetails.artists.length > 0 ? trackDetails.artists[0].name : "";
    const likesCount = trackDetails.likesCount || 0;
    const commentsCount = propCommentsCount !== undefined ? propCommentsCount : (trackDetails.commentsCount || 0);

    const userRating = trackDetails?.currentUserInteraction?.rating
        ? Number(trackDetails.currentUserInteraction.rating)
        : 0;
    const userComment = trackDetails?.currentUserInteraction?.comment?.content || "";
    const hasUserInteraction = userRating > 0 || (typeof userComment === "string" && userComment.trim().length > 0);

    const spotifyId = trackDetails.spotifyId;
    const handleSpotifyPress = () => {
        if (spotifyId) {
            Linking.openURL(`https://open.spotify.com/track/${spotifyId}`).catch((err) => {
                console.error("Failed to open Spotify track:", err);
            });
        } else if (onPlayPress) {
            onPlayPress();
        }
    };

    return (
        <>
            <View style={styles.heroBanner}>
                {trackDetails.image ? (
                    <ImageBackground style={styles.bannerBackgroundImg} source={{ uri: trackDetails.image.toString() }}>
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
                        {trackDetails.image ? (
                            <Image
                                source={{ uri: trackDetails.image.toString() }}
                                style={styles.poster}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.poster, styles.posterPlaceholder]}>
                                <Ionicons name="musical-note-outline" size={36} color={Colors.textSecondary} />
                            </View>
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.titleWrapper}>
                            <Text style={styles.trackTitle} numberOfLines={2}>
                                {trackDetails.title}
                            </Text>
                        </View>

                        {trackDetails.artists && trackDetails.artists.length > 0 && (
                            <TouchableOpacity style={styles.creatorContainer} activeOpacity={0.8}>
                                {trackDetails.artists[0].avatar ? (
                                    <Image
                                        source={{ uri: trackDetails.artists[0].avatar.toString() }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                        <Text style={styles.avatarLetter}>
                                            {(artistName || "U").charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <Text style={styles.creatorName} numberOfLines={1}>
                                    {artistName}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.movieStats}>
                            <Badge icon={<Ionicons name="heart" size={12} color="#FF8000" />} value={likesCount} />
                            <Badge icon={<Entypo name="text" size={12} color="#FF8000" />} value={commentsCount} />
                        </View>

                        <View style={styles.actionBar}>
                            <ActionButton
                                iconComponent={<FontAwesome name="spotify" size={20} color="#1DB954" />}
                                isActive={false}
                                activeColor="rgba(29, 185, 84, 0.2)"
                                onPress={handleSpotifyPress}
                                disabled={!spotifyId && !onPlayPress}
                                testID="track-spotify-button"
                            />

                            <ActionButton
                                icon="add-outline"
                                isActive={false}
                                activeColor={`${Colors.secondary}66`}
                                onPress={onAddPress || (() => {})}
                            />

                            <ActionButton
                                icon="heart"
                                isActive={!!trackDetails.isLiked}
                                activeColor={`${Colors.accentPink}66`}
                                onPress={toggleLike}
                            />

                            <ActionButton
                                icon="star"
                                isActive={hasUserInteraction}
                                activeColor={`${Colors.warning}66`}
                                onPress={onCommentPress || (() => {})}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
}
