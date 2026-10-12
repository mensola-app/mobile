import React, { useState } from "react";
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    useWindowDimensions,
    NativeSyntheticEvent,
    TextLayoutEventData,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import { IDetailHeroProps } from "./types";
import DetailHeroCover from "./DetailHeroCover";
import { Colors } from "@/constants/colors";

export default function DetailHero({
    bannerImageUri,
    cover,
    title,
    titleRight,
    subtitle,
    stats,
    actions,
    description,
    descriptionNumberOfLines = 2,
    children,
    style,
    testID,
}: IDetailHeroProps) {
    const { width: windowWidth } = useWindowDimensions();
    const isSmallScreen = windowWidth < 380;
    const posterWidth = isSmallScreen ? 106 : 120;
    const contentGap = isSmallScreen ? 12 : 16;

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);

    const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (e.nativeEvent.lines.length > descriptionNumberOfLines && !isDescriptionTruncated) {
            setIsDescriptionTruncated(true);
        }
    };

    return (
        <View style={style} testID={testID}>
            <View style={styles.heroBanner}>
                {bannerImageUri ? (
                    <ImageBackground
                        style={styles.bannerBackgroundImg}
                        source={{ uri: bannerImageUri }}
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

                <View style={[styles.bannerContent, { gap: contentGap }]}>
                    <View style={[styles.posterWrapper, { width: posterWidth }]}>
                        {cover}
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.titleWrapper}>
                            {typeof title === "string" ? (
                                <Text style={styles.title} numberOfLines={2}>
                                    {title}
                                </Text>
                            ) : (
                                title
                            )}
                            {titleRight ? (
                                typeof titleRight === "string" ? (
                                    <Text style={styles.titleRight}>{titleRight}</Text>
                                ) : (
                                    titleRight
                                )
                            ) : null}
                        </View>

                        {subtitle ? (
                            <View style={styles.subtitleWrapper}>
                                {subtitle}
                            </View>
                        ) : null}

                        {stats ? (
                            <View style={styles.stats}>
                                {stats}
                            </View>
                        ) : null}

                        {actions ? (
                            <View style={styles.actionBar}>
                                {actions}
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>

            {description ? (
                <View style={styles.descriptionSection}>
                    <Text
                        style={styles.description}
                        numberOfLines={isDescriptionExpanded ? undefined : descriptionNumberOfLines}
                        onTextLayout={handleTextLayout}
                    >
                        {description}
                    </Text>
                    {isDescriptionTruncated && (
                        <TouchableOpacity
                            style={styles.readMoreButton}
                            onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        >
                            <Text style={styles.readMoreText}>
                                {isDescriptionExpanded ? "Daha Az" : "Daha Fazla"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : null}

            {children}
        </View>
    );
}

DetailHero.Cover = DetailHeroCover;
