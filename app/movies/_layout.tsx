import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/PageHeader";
import { Colors } from "@/constants/colors";

export default function MoviesLayout() {
    const { t } = useTranslation();
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTransparent: true,
                header: (props) => <PageHeader {...props} />,
                contentStyle: { backgroundColor: Colors.background },
                animation: "slide_from_right",
            }}>
            <Stack.Screen name="[movieId]" options={{ title: t("common.movie", "Film") }} />
        </Stack>
    );
}
