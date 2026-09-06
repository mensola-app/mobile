import React, { useMemo } from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { CommentThreadView, CommentDetailParams, threadStyles as styles } from "@/components/CommentThread";
import { useCommentDetail } from "@/hooks/comment/useCommentDetail";
import { CommentId } from "@/types/common.types";
import { InteractionItemResponse } from "@/types/interaction.types";

export default function CommentDetailScreen() {
    const { t } = useTranslation();
    const params = useLocalSearchParams<CommentDetailParams>();
    const commentId = params.commentId as CommentId;

    // Parse serialized interaction from navigation params safely
    const interactionData: InteractionItemResponse | null = useMemo(() => {
        try {
            return params.interactionData ? JSON.parse(params.interactionData) : null;
        } catch {
            return null;
        }
    }, [params.interactionData]);

    const thread = useCommentDetail(commentId, interactionData);

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{ title: t("comments.threadTitle", "Tartışma") }} />
            <CommentThreadView
                mediaPoster={params.mediaPoster}
                mediaTitle={params.mediaTitle}
                mediaType={params.mediaType}
                thread={thread}
            />
        </View>
    );
}
