import { useState } from "react";
import {
    View,
    Text,
    Image,
    ImageBackground,
    TouchableOpacity,
    NativeSyntheticEvent,
    TextLayoutEventData,
    Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Ionicons } from "@expo/vector-icons";

import ActionButton from "@/components/Movies/ActionButton";
import Badge from "@/components/Badge";
import MovieListOwnersBottomSheet from "./MovieListOwnersBottomSheet";
import { styles } from "./styles";
import { IMovieListHeroProps } from "./types";
import { shareMovieList } from "@/utils/share";
import { Colors } from "@/constants/colors";

export default function MovieListHero({
    listDetails,
    moviesCount,
    movies,
    commentsCount,
    toggleLike,
    toggleSave,
    onCommentPress,
    onSharePress,
}: IMovieListHeroProps) {
    const [isOwnersSheetVisible, setIsOwnersSheetVisible] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);

    if (!listDetails) return null;

    const owners = listDetails.owners || [];
    const creator = owners.find((owner) => owner.id === listDetails.creatorId) || owners[0];
    const creatorName = creator ? creator.fullname || creator.username : "";
    const othersCount = owners.length > 1 ? owners.length - 1 : 0;
    const ownerText = othersCount > 0 ? `${creatorName} ve ${othersCount} diğer yönetici` : creatorName;
    const likesCount = listDetails.likesCount || 0;

    const isSaved = listDetails?.isSaved ?? false;
    const userRating = listDetails?.currentUserInteraction?.rating || 0;
    const userComment = listDetails?.currentUserInteraction?.comment?.content || "";
    const hasUserInteraction = userRating > 0 || (typeof userComment === "string" && userComment.trim().length > 0);

    const moviePosters: string[] = (movies?.map((m) => m.poster).filter(Boolean) || []) as string[];

    const bannerImageUri =
        (listDetails.image ? listDetails.image.toString() : null) ||
        (moviePosters.length > 0 ? moviePosters[0] : null);

    const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (e.nativeEvent.lines.length > 2 && !isDescriptionTruncated) {
            setIsDescriptionTruncated(true);
        }
    };

    const handleShare = async () => {
        if (onSharePress) {
            onSharePress();
            return;
        }

        if (!listDetails) return;

        await shareMovieList({
            id: listDetails.id,
            title: listDetails.title,
        });
    };

    let heroCoverContent: React.ReactNode = null;
    if (listDetails.image) {
        heroCoverContent = (
            <Image
                source={{ uri: listDetails.image.toString() }}
                style={styles.poster}
                resizeMode="cover"
            />
        );
    } else if (moviePosters.length === 0) {
        heroCoverContent = (
            <View style={[styles.poster, styles.posterPlaceholder]}>
                <Ionicons name="film-outline" size={36} color={Colors.textSecondary} />
            </View>
        );
    } else if (moviePosters.length < 4) {
        heroCoverContent = (
            <Image
                source={{ uri: moviePosters[0] }}
                style={styles.poster}
                resizeMode="cover"
            />
        );
    } else {
        heroCoverContent = (
            <View style={[styles.poster, { flexDirection: "row", flexWrap: "wrap", overflow: "hidden" }]}>
                {moviePosters.slice(0, 4).map((posterUri, idx) => (
                    <Image key={idx} source={{ uri: posterUri }} style={{ width: "50%", height: "50%" }} resizeMode="cover" />
                ))}
            </View>
        );
    }

    return (
        <>
            <View style={styles.heroBanner}>
                {bannerImageUri ? (
                    <ImageBackground style={styles.bannerBackgroundImg} source={{ uri: bannerImageUri }}>
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
                        {heroCoverContent}
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.titleWrapper}>
                            <Text style={styles.movieTitle} numberOfLines={2}>
                                {listDetails.title}
                            </Text>
                        </View>

                        {creator && (
                            <TouchableOpacity
                                style={styles.creatorContainer}
                                onPress={() => setIsOwnersSheetVisible(true)}
                                activeOpacity={0.8}>
                                {creator.avatar ? (
                                    <Image source={{ uri: creator.avatar.toString() }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                        <Text style={styles.avatarLetter}>
                                            {(creatorName || "U").charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <Text style={styles.creatorName} numberOfLines={1}>
                                    {ownerText}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.movieStats}>
                            <Badge
                                icon={<Ionicons name="film-outline" size={12} color="#FF8000" />}
                                value={moviesCount}
                            />
                            <Badge icon={<Ionicons name="heart" size={12} color="#FF8000" />} value={likesCount} />
                            <Badge icon={<Entypo name="text" size={12} color="#FF8000" />} value={commentsCount ?? 0} />
                            <Badge
                                icon={<Ionicons name="bookmark" size={12} color="#FF8000" />}
                                value={listDetails.savesCount ?? 0}
                            />
                        </View>

                        <View style={styles.actionBar}>
                            {/* 1. Yer İmi (Kaydet) */}
                            <ActionButton
                                icon={isSaved ? "bookmark" : "bookmark-outline"}
                                isActive={isSaved}
                                activeColor={`${Colors.warning}66`}
                                onPress={toggleSave}
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
                                isActive={!!listDetails.isLiked}
                                activeColor={`${Colors.accentPink}66`}
                                onPress={toggleLike}
                            />

                            {/* 4. Listeyi Puanla */}
                            <ActionButton
                                icon="star"
                                isActive={hasUserInteraction}
                                activeColor={`${Colors.warning}66`}
                                onPress={onCommentPress}
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* List Description below Hero Banner */}
            {listDetails.description ? (
                <View style={styles.descriptionSection}>
                    <Text
                        style={styles.description}
                        numberOfLines={isDescriptionExpanded ? undefined : 2}
                        onTextLayout={handleTextLayout}>
                        {listDetails.description}
                    </Text>

                    {(isDescriptionTruncated || isDescriptionExpanded) && (
                        <TouchableOpacity
                            onPress={() => setIsDescriptionExpanded((prev) => !prev)}
                            activeOpacity={0.7}
                            style={styles.readMoreButton}>
                            <Text style={styles.readMoreText}>{isDescriptionExpanded ? "Daha Az" : "Daha Fazla"}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : null}

            <MovieListOwnersBottomSheet
                isVisible={isOwnersSheetVisible}
                onClose={() => setIsOwnersSheetVisible(false)}
                owners={owners}
                creatorId={listDetails.creatorId}
            />
        </>
    );
}
