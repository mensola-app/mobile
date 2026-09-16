import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import DynamicList from "@/components/DynamicList";
import CastCard from "./CastCard";
import CrewCard from "./CrewCard";
import { MovieCredits, MovieCreditPerson } from "@/types/movie.types";
import { Colors } from "@/constants/colors";

interface MovieCreditsSectionProps {
    credits?: MovieCredits;
}

interface CrewItem {
    person: MovieCreditPerson;
    role: string;
}

export default function MovieCreditsSection({ credits }: MovieCreditsSectionProps) {
    const { t } = useTranslation();

    if (!credits) return null;

    const { cast, crew } = credits;
    const hasCast = cast && cast.length > 0;

    // Flatten crew into a single list with roles
    const crewItems: CrewItem[] = [];
    if (crew) {
        crew.directors?.forEach((p) => crewItems.push({ person: p, role: t("movies.detail.roleDirector") }));
        crew.writers?.forEach((p) => crewItems.push({ person: p, role: t("movies.detail.roleWriter") }));
        crew.cinematographers?.forEach((p) => crewItems.push({ person: p, role: t("movies.detail.roleCinematography") }));
    }
    const hasCrew = crewItems.length > 0;

    if (!hasCast && !hasCrew) return null;

    return (
        <View style={styles.container}>
            {hasCast && (
                <DynamicList<MovieCreditPerson>
                    title={t("movies.detail.cast")}
                    data={cast}
                    variant="horizontal"
                    renderItem={({ item }) => <CastCard person={item} />}
                    ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                />
            )}

            {hasCrew && (
                <View style={styles.crewSection}>
                    <Text style={styles.sectionTitle}>{t("movies.detail.crew")}</Text>
                    {crewItems.map((item, index) => (
                        <CrewCard
                            key={`${item.person.id}-${item.role}-${index}`}
                            person={item.person}
                            role={item.role}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
        paddingTop: 8,
    },
    crewSection: {
        paddingHorizontal: 16,
        gap: 2,
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
        marginHorizontal: 8,
    },
});
