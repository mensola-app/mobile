import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/PageHeader";
import { Colors } from "@/constants/colors";

export default function ArtistsLayout() {
    const { t } = useTranslation();
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                header: (props) => <PageHeader {...props} />,
                contentStyle: { backgroundColor: Colors.background },
                animation: "slide_from_right",
            }}>
            <Stack.Screen
                name="[id]/index"
                options={{
                    headerTransparent: true,
                    title: t("common.artist", "Sanatçı"),
                }}
            />
            <Stack.Screen
                name="[id]/discography"
                options={{
                    headerTransparent: false,
                    title: t("artist.discography", "Diskografi"),
                }}
            />
        </Stack>
    );
}
