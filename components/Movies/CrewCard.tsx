import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { MovieCreditPerson } from "@/types/movie.types";

interface CrewCardProps {
    person: MovieCreditPerson;
    role: string;
}

export default function CrewCard({ person, role }: CrewCardProps) {
    const hasImage = !!person.profilePath && person.profilePath !== "";

    return (
        <View style={styles.card}>
            <View style={styles.imageWrapper}>
                {hasImage ? (
                    <Image source={{ uri: person.profilePath }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.placeholder]}>
                        <Ionicons name="person" size={18} color={Colors.textMuted} />
                    </View>
                )}
            </View>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {person.name}
                </Text>
                <Text style={styles.role} numberOfLines={1}>
                    {role}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 6,
    },
    imageWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: Colors.surfaceLight,
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
    info: {
        flex: 1,
        gap: 2,
    },
    name: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: "600",
    },
    role: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
});
