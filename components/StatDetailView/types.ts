import { LikedAlbumsResponseDataItem } from "@/types/album.types";
import { UserId } from "@/types/common.types";
import { GetListsResponseDataItem, IMovie, MovieSummaryViaInteraction } from "@/types/movie.types";
import { GetPlaylistsResponseDataItem, PlaylistItemsResponseDataItem } from "@/types/playlist.types";
import { StatDetailsItemMap, StatType } from "@/types/stat.types";
import { FavoriteTracks, ITrack } from "@/types/track.types";
import { FollowUsersResponseDataItem } from "@/types/user.types";

export type StatDetailProps<T extends StatType = StatType> = {
    currentUserId: UserId;
    statType: T;
    items?: StatDetailsItemMap[T][];
    loadMore?: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    isLoading?: boolean;
    isRefetching?: boolean;
    isError?: boolean;
    refetch?: () => void;
    isOwnProfile?: boolean;
};
export type ViewTypes = "dynamic-list" | "music-card" | "movie-card" | "user-card";

export type StatDetailItemProps<T extends StatType = StatType> = { viewType?: ViewTypes } & (
    | {
          viewType?: "dynamic-list";
          data: MovieSummaryViaInteraction[];
          listTitle?: string;
          onSeeAllPress?: () => void;
          onListItemPress?: (movieId: string) => void;
      }
    | ({
          viewType?: "music-card";
          hideCreator?: boolean;
          onPress?: () => void;
      } & (
          | { cardType: "track"; data: ITrack | PlaylistItemsResponseDataItem }
          | { cardType: "album"; data: LikedAlbumsResponseDataItem }
          | { cardType: "playlist"; data: GetPlaylistsResponseDataItem }
      ))
    | ({
          viewType?: "movie-card";
          onPress?: () => void;
      } & (
          | { cardType?: "movie"; data: MovieSummaryViaInteraction }
          | { cardType: "movie-list"; data: GetListsResponseDataItem; hideCreator?: boolean }
      ))
    | {
          viewType?: "user-card";
          data: FollowUsersResponseDataItem;
          currentUserId: UserId;
          onCardPress?: (userId: UserId) => void;
          onFollowPress?: (userId: UserId, isFollowing: boolean, isPending?: boolean) => void;
          isFirst?: boolean;
          isLast?: boolean;
      }
);
