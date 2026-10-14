import { StyleProp, ViewStyle } from "react-native";
import { IMovie, IMovieList, GetListsResponseDataItem, MovieSummaryViaInteraction } from "@/types/movie.types";

export type MovieCardListData = Partial<IMovieList> & Partial<GetListsResponseDataItem> & {
    listTitle?: string;
    title?: string;
    image?: URL | string | null;
    previewImages?: string[];
    previewMovies?: (MovieSummaryViaInteraction | { poster?: string })[];
    movies?: { poster?: string }[];
    creator?: { username?: string; avatar?: string; id?: string };
    owners?: { username?: string }[];
    movieCount?: number;
};

export type MovieCardMovieData = Partial<IMovie> & Partial<MovieSummaryViaInteraction> & {
    title?: string;
    poster?: string;
    releaseDate?: string;
    genres?: string[];
    ratingAverage?: number;
    watchCount?: number;
    interactions?: IMovieCardInteractions;
};

export interface IMovieCardInteractions {
    rating?: number | string;
    isLiked?: boolean;
    hasReview?: boolean;
    totalLikes?: number;
    totalReviews?: number;
    watchCount?: number;
}

export interface IMovieCardFooterProps {
    interactions: IMovieCardInteractions;
    variant: "profile" | "feed";
    layout?: "horizontal" | "vertical";
}

type IMovieCardBaseProps = {
    layout?: "horizontal" | "vertical";
    variant?: "profile" | "feed";
    compact?: boolean;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
};

export type IMovieCardProps<
    TMovie extends Omit<IMovie, "id"> = Omit<IMovie, "id">,
    TMovieList extends Omit<IMovieList, "id"> = Omit<IMovieList, "id">,
> = IMovieCardBaseProps & (
    | {
          type?: "movie";
          data?: TMovie | MovieSummaryViaInteraction;
          title?: string;
          poster?: string;
          interactions?: IMovieCardInteractions;
          releaseDate?: string;
          genres?: string[];
          ratingAverage?: number;
          watchCount?: number;
      }
    | {
          type: "movie-list";
          data: TMovieList | GetListsResponseDataItem | IMovieList;
          hideCreator?: boolean;
          title?: string;
          poster?: string;
          interactions?: IMovieCardInteractions;
      }
);

