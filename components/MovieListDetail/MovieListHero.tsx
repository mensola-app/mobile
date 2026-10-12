import { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";

import ActionButton from "@/components/Movies/ActionButton";
import Badge from "@/components/Badge";
import MovieListOwnersBottomSheet from "./MovieListOwnersBottomSheet";
import { styles } from "./styles";
import { IMovieListHeroProps } from "./types";
import { shareMovieList } from "@/utils/share";
import { Colors } from "@/constants/colors";
import DetailHero from "@/components/DetailHero";

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
            <DetailHero.Cover
                imageUri={listDetails.image.toString()}
                aspectRatio={2 / 3}
            />
        );
    } else if (moviePosters.length === 0) {
        heroCoverContent = (
            <DetailHero.Cover
                placeholderIcon="film-outline"
                aspectRatio={2 / 3}
            />
        );
    } else if (moviePosters.length < 4) {
        heroCoverContent = (
            <DetailHero.Cover
                imageUri={moviePosters[0]}
                aspectRatio={2 / 3}
            />
        );
    } else {
        heroCoverContent = (
            <DetailHero.Cover aspectRatio={2 / 3}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", width: "100%", height: "100%", overflow: "hidden" }}>
                    {moviePosters.slice(0, 4).map((posterUri, idx) => (
                        <Image key={idx} source={{ uri: posterUri }} style={{ width: "50%", height: "50%" }} resizeMode="cover" />
                    ))}
                </View>
            </DetailHero.Cover>
        );
    }

    return (
        <>
            <DetailHero
                bannerImageUri={bannerImageUri}
                cover={heroCoverContent}
                title={listDetails.title}
                subtitle={
                    creator ? (
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
                    ) : null
                }
                stats={
                    <>
                        <Badge
                            icon={<Ionicons name="film-outline" size={12} color="#FF8000" />}
                            value={listDetails.movieCount ?? moviesCount}
                        />
                        <Badge icon={<Ionicons name="heart" size={12} color="#FF8000" />} value={likesCount} />
                        <Badge icon={<Entypo name="text" size={12} color="#FF8000" />} value={commentsCount ?? 0} />
                        <Badge
                            icon={<Ionicons name="bookmark" size={12} color="#FF8000" />}
                            value={listDetails.savesCount ?? 0}
                        />
                    </>
                }
                actions={
                    <>
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
                    </>
                }
                description={listDetails.description}
            />

            <MovieListOwnersBottomSheet
                isVisible={isOwnersSheetVisible}
                onClose={() => setIsOwnersSheetVisible(false)}
                owners={owners}
                creatorId={listDetails.creatorId}
            />
        </>
    );
}
