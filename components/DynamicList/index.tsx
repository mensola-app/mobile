import { View, Text, TouchableOpacity, FlatList, Platform, RefreshControl } from "react-native";
import { useTranslation } from "react-i18next";

import { styles } from "./styles";
import { IDynamicListProps } from "./types";
import { Colors } from "@/constants/colors";

const defaultKeyExtractor = (item: any, index: number): string => {
    if (!item) return index.toString();
    if (typeof item === "string" || typeof item === "number") return item.toString();
    const id = item.id ?? item.tmdbId ?? item.spotifyId ?? item.commentId ?? item.key;
    if (id !== undefined && id !== null) return String(id);
    return index.toString();
};

export default function DynamicList<T>({
    title,
    data,
    renderItem,
    onSeeAllPress,
    seeAllText,
    variant = "horizontal",
    ItemSeparatorComponent,
    style,
    contentContainerStyle,
    keyExtractor = defaultKeyExtractor,
    initialNumToRender,
    maxToRenderPerBatch,
    windowSize,
    removeClippedSubviews = Platform.OS === "android",
    onRefresh,
    refreshing,
    refreshControl,
    ...restProps
}: IDynamicListProps<T>) {
    const { t } = useTranslation();
    const isHorizontal = variant === "horizontal";

    const renderDefaultSeparator = () => <View style={isHorizontal ? { width: 16 } : { height: 16 }} />;

    const resolvedRefreshControl =
        refreshControl !== undefined
            ? refreshControl
            : !isHorizontal && onRefresh
              ? (
                    <RefreshControl
                        refreshing={Boolean(refreshing)}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                )
              : undefined;

    return (
        <View style={styles.container}>
            {title ? (
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{title}</Text>
                    {onSeeAllPress && (
                        <TouchableOpacity onPress={onSeeAllPress}>
                            <Text style={styles.seeAll}>{seeAllText || t("common.seeAll", "Hepsini Gör")}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : null}

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                horizontal={isHorizontal}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={ItemSeparatorComponent || renderDefaultSeparator}
                initialNumToRender={initialNumToRender ?? (isHorizontal ? 6 : 8)}
                maxToRenderPerBatch={maxToRenderPerBatch ?? (isHorizontal ? 6 : 8)}
                windowSize={windowSize ?? (isHorizontal ? 5 : 7)}
                removeClippedSubviews={removeClippedSubviews}
                refreshControl={resolvedRefreshControl}
                contentContainerStyle={[
                    isHorizontal ? styles.horizontalContent : styles.verticalContent,
                    style,
                    contentContainerStyle,
                ]}
                {...restProps}
            />
        </View>
    );
}
