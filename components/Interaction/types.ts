import { InteractionItemResponse } from "@/types/interaction.types";

export type IInteractionViewProps = {
    data: InteractionItemResponse;
    disabled?: boolean;
    onLike?: (commentId?: string) => void;
};
