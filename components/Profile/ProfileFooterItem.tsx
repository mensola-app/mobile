import { Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { IFooterItemProps } from "./types";
import { StatTypeKey, getStatLabels } from "@/types/stat.types";
import { Colors } from "@/constants/colors";
import { ListGroupItem } from "../ListGroup";
import { styles } from "./styles";

type StatConfig = {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
};

const STAT_CONFIG: Record<StatTypeKey, StatConfig> = {
    watchedMoviesCount: { icon: "checkmark-circle-outline", color: Colors.accentPink },
    watchlistMoviesCount: { icon: "bookmark-outline", color: Colors.accentPink },
    likedMoviesCount: { icon: "heart-outline", color: Colors.accentPink },
    movieListCount: { icon: "film-outline", color: Colors.accentPink },
    likedMovieListsCount: { icon: "copy-outline", color: Colors.accentPink },
    likedTracksCount: { icon: "musical-note-outline", color: Colors.primary },
    likedAlbumsCount: { icon: "disc-outline", color: Colors.primary },
    playlistCount: { icon: "musical-notes-outline", color: Colors.primary },
    likedPlaylistsCount: { icon: "list-outline", color: Colors.primary },
    followersCount: { icon: "people-outline", color: Colors.secondary },
    followingCount: { icon: "person-add-outline", color: Colors.secondary },
};

interface GroupedFooterItemProps extends IFooterItemProps {
    isFirst?: boolean;
    isLast?: boolean;
}

export default function ProfileFooterItem({ statType, statValue, onPress, isFirst = false, isLast = false }: GroupedFooterItemProps) {
    const { t } = useTranslation();
    const cfg = STAT_CONFIG[statType] ?? { icon: "stats-chart-outline" as const, color: Colors.textMuted };

    return (
        <ListGroupItem isFirst={isFirst} isLast={isLast} onPress={() => onPress?.(statType)}>
            <View style={styles.footerItemLeft}>
                <Ionicons name={cfg.icon} size={17} color={cfg.color} />
                <Text style={styles.footerItemLabel}>{getStatLabels(t)[statType]}</Text>
            </View>
            <View style={styles.footerItemRight}>
                <Text style={styles.footerItemValue}>{statValue}</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
            </View>
        </ListGroupItem>
    );
}
