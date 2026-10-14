import {
    View,
    Text,
    TouchableOpacity,
    Linking,
} from "react-native";
import { Image } from "expo-image";
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";

import ActionButton from "@/components/Movies/ActionButton";
import Badge from "@/components/Badge";
import { styles } from "./styles";
import { ITrackHeroProps } from "./types";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { LINKS } from "@/constants/links";
import DetailHero from "@/components/DetailHero";

export default function TrackHero({
    trackDetails,
    toggleLike,
    onCommentPress,
    onAddPress,
    onPlayPress,
    commentsCount: propCommentsCount,
}: ITrackHeroProps) {
    const router = useRouter();

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
            Linking.openURL(LINKS.spotify.track(spotifyId)).catch((err) => {
                console.error("Failed to open Spotify track:", err);
            });
        } else if (onPlayPress) {
            onPlayPress();
        }
    };

    return (
        <DetailHero
            bannerImageUri={trackDetails.image ? trackDetails.image.toString() : null}
            cover={
                <DetailHero.Cover
                    imageUri={trackDetails.image ? trackDetails.image.toString() : null}
                    placeholderIcon="musical-note-outline"
                    aspectRatio={1}
                />
            }
            title={trackDetails.title}
            subtitle={
                trackDetails.artists && trackDetails.artists.length > 0 ? (
                    <TouchableOpacity
                        style={styles.creatorContainer}
                        activeOpacity={0.8}
                        onPress={() => {
                            const artist = trackDetails.artists![0];
                            const id = artist.spotifyId || artist.id;
                            if (id) router.push(`/artists/${id}`);
                        }}
                    >
                        {trackDetails.artists[0].avatar ? (
                            <Image
                                source={{ uri: trackDetails.artists[0].avatar.toString() }}
                                style={styles.avatar}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                transition={150}
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
                ) : null
            }
            stats={
                <>
                    <Badge icon={<Ionicons name="heart" size={12} color="#FF8000" />} value={likesCount} />
                    <Badge icon={<Entypo name="text" size={12} color="#FF8000" />} value={commentsCount} />
                </>
            }
            actions={
                <>
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
                </>
            }
        />
    );
}
