import { MovieSummaryViaInteraction } from "@/types/movie.types";
import { ITrack } from "@/types/track.types";
import { IUser } from "@/types/user.types";
import { RefObject } from "react";
import { View } from "react-native";

export interface ITasteCardProps {
    cardRef?: RefObject<View | null>;
    user: Partial<IUser> | null;
    favoriteMovies: MovieSummaryViaInteraction[];
    favoriteTracks: ITrack[];
    squareCorners?: boolean;
}

export interface ITasteCardViewProps {
    cardRef: RefObject<View | null>;
    user: Partial<IUser> | null;
    favoriteMovies: MovieSummaryViaInteraction[];
    favoriteTracks: ITrack[];
    isSharing: boolean;
    onClose: () => void;
    onShare: () => void;
}
