import { Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

import { IArtistCardProps } from "./types";
import { styles } from "./styles";

export default function ArtistCard({ artist, onPress }: IArtistCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.avatarWrapper}>
                <Image
                    source={{ uri: artist.avatar?.toString() }}
                    style={styles.fullImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={150}
                />
            </View>
            <Text style={styles.mainTitle} numberOfLines={1}>
                {artist.name}
            </Text>
            {artist.followerCount && (
                <Text style={styles.subTitle} numberOfLines={1}>
                    {`${artist.followerCount} followers`}
                </Text>
            )}
        </TouchableOpacity>
    );
}
