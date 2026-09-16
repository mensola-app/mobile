import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { MovieCreditPerson } from "@/types/movie.types";

interface CastCardProps {
    person: MovieCreditPerson;
}

export default function CastCard({ person }: CastCardProps) {
    const hasImage = !!person.profilePath && person.profilePath !== "";

    return (
        <View style={styles.card}>
            <View style={styles.imageWrapper}>
                {hasImage ? (
                    <Image source={{ uri: person.profilePath }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.placeholder]}>
                        <Ionicons name="person" size={28} color={Colors.textMuted} />
                    </View>
                )}
            </View>
            <Text style={styles.name} numberOfLines={2}>
                {person.name}
            </Text>
            {person.character ? (
                <Text style={styles.character} numberOfLines={2}>
                    {person.character}
                </Text>
            ) : null}
        </View>
    );
}

const CARD_WIDTH = 100;

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        alignItems: "center",
    },
    imageWrapper: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.3,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: Colors.surfaceLight,
        marginBottom: 8,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    placeholder: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.surface,
    },
    name: {
        color: Colors.textPrimary,
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
        lineHeight: 16,
    },
    character: {
        color: Colors.textSecondary,
        fontSize: 11,
        textAlign: "center",
        marginTop: 2,
        lineHeight: 14,
    },
});
