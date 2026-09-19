import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useTranslation } from "react-i18next";

import { styles } from "./styles";
import { IDynamicListProps } from "./types";

export default function DynamicList<T>({
    title,
    data,
    renderItem,
    onSeeAllPress,
    seeAllText,
    variant = "horizontal",
    ItemSeparatorComponent,
    style,
    ...restProps
}: IDynamicListProps<T>) {
    const { t } = useTranslation();
    const isHorizontal = variant === "horizontal";

    const renderDefaultSeparator = () => <View style={isHorizontal ? { width: 16 } : { height: 16 }} />;

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
                keyExtractor={(_, index) => index.toString()}
                horizontal={isHorizontal}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={ItemSeparatorComponent || renderDefaultSeparator}
                contentContainerStyle={[isHorizontal ? styles.horizontalContent : styles.verticalContent, style]}
                {...restProps}
            />
        </View>
    );
}
