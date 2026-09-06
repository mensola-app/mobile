import { InteractionItemResponse } from "@/types/interaction.types";

export interface EntityInteractionsViewProps {
    type?: string;
    id?: string;
    interactions: InteractionItemResponse[];
    isLoading?: boolean;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    isRefetching?: boolean;
    error?: any;
    onEndReached?: () => void;
    onRefresh?: () => void;
    onLike?: (commentId?: string) => void;
}
