import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Linking,
} from "react-native";
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";

import ActionButton from "@/components/Movies/ActionButton";
import Badge from "@/components/Badge";
import { styles } from "./styles";
import { IAlbumHeroProps } from "./types";
import { useRouter } from "expo-router";
import { shareAlbum } from "@/utils/share";
import { Colors } from "@/constants/colors";
import DetailHero from "@/components/DetailHero";

export default function AlbumHero({
    albumDetails,
    tracksCount,
    commentsCount,
    toggleLike,
    onCommentPress,
    onSharePress,
    onPlayPress,
}: IAlbumHeroProps) {
    const router = useRouter();

    if (!albumDetails) return null;

    const artist = albumDetails.artists && albumDetails.artists.length > 0 ? albumDetails.artists[0] : null;
    const artistName = artist ? artist.name : "";
    const likesCount = albumDetails.likesCount || 0;
    const userRating = albumDetails?.currentUserInteraction?.rating
        ? Number(albumDetails.currentUserInteraction.rating)
        : 0;
    const userComment = albumDetails?.currentUserInteraction?.comment?.content || "";
    const hasUserInteraction = userRating > 0 || (typeof userComment === "string" && userComment.trim().length > 0);

    const spotifyId = albumDetails.spotifyId;
    const handleSpotifyPress = () => {
        if (spotifyId) {
            Linking.openURL(`https://open.spotify.com/album/${spotifyId}`).catch((err) => {
                console.error("Failed to open Spotify album:", err);
            });
        } else if (onPlayPress) {
            onPlayPress();
        }
    };

    const handleShare = async () => {
        if (onSharePress) {
            onSharePress();
            return;
        }

        if (!albumDetails) return;

        await shareAlbum({
            id: albumDetails.id,
            title: albumDetails.title,
        });
    };

    return (
        <DetailHero
            bannerImageUri={albumDetails.image ? albumDetails.image.toString() : null}
            cover={
                <DetailHero.Cover
                    imageUri={albumDetails.image ? albumDetails.image.toString() : null}
                    placeholderIcon="disc-outline"
                    aspectRatio={1}
                />
            }
            title={albumDetails.title}
            subtitle={
                artist ? (
                    <TouchableOpacity 
                        style={styles.creatorContainer} 
                        activeOpacity={0.8}
                        onPress={() => {
                            const id = artist.spotifyId || artist.id;
                            if (id) router.push(`/artists/${id}`);
                        }}
                    >
                        {artist.avatar ? (
                            <Image source={{ uri: artist.avatar.toString() }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarLetter}>
                                    {(artistName || "A").charAt(0).toUpperCase()}
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
                    <Badge
                        icon={<Ionicons name="musical-note-outline" size={12} color="#FF8000" />}
                        value={tracksCount}
                    />
                    <Badge
                        icon={<Ionicons name="heart" size={12} color="#FF8000" />}
                        value={likesCount}
                    />
                    <Badge
                        icon={<Entypo name="text" size={12} color="#FF8000" />}
                        value={commentsCount ?? 0}
                    />
                </>
            }
            actions={
                <>
                    {/* 1. Dinle (Spotify) */}
                    <ActionButton
                        iconComponent={<FontAwesome name="spotify" size={20} color="#1DB954" />}
                        isActive={false}
                        activeColor="rgba(29, 185, 84, 0.2)"
                        onPress={handleSpotifyPress}
                        disabled={!spotifyId && !onPlayPress}
                        testID="album-spotify-button"
                    />

                    {/* 2. Paylaş */}
                    <ActionButton
                        icon="share-social-outline"
                        isActive={false}
                        activeColor={`${Colors.primary}66`}
                        onPress={handleShare}
                    />

                    {/* 3. Beğen */}
                    <ActionButton
                        icon="heart"
                        isActive={!!albumDetails.isLiked}
                        activeColor={`${Colors.accentPink}66`}
                        onPress={toggleLike}
                    />

                    {/* 4. Oyla */}
                    <ActionButton
                        icon="star"
                        isActive={hasUserInteraction}
                        activeColor={`${Colors.warning}66`}
                        onPress={onCommentPress}
                    />
                </>
            }
        />
    );
}
