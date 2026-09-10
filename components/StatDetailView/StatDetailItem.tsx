import { StatDetailsItemMap, StatType } from "@/types/stat.types";
import DynamicList from "../DynamicList";
import MovieCard from "../MovieCard";
import MusicCard from "../MusicCard";
import UserCard from "../UserCard";
import { StatDetailItemProps } from "./types";
import { GetListsResponseDataItem } from "@/types/movie.types";

export default function StatDetailItem<T extends StatType = StatType>(props: StatDetailItemProps<T>) {
    switch (props.viewType) {
        case "dynamic-list": {
            const { data, onSeeAllPress, onListItemPress, listTitle } = props;
            return (
                <DynamicList
                    data={data}
                    title={listTitle}
                    renderItem={({ item: movie }) => (
                        <MovieCard
                            key={movie.id}
                            title={movie.title}
                            poster={movie.poster}
                            interactions={{
                                rating: movie?.rating,
                                isLiked: movie.isLiked,
                                hasReview: movie.hasReview,
                                watchCount: (movie as any).watchCount,
                            }}
                            onPress={() => onListItemPress?.(movie.id)}
                        />
                    )}
                    onSeeAllPress={onSeeAllPress}
                />
            );
        }
        case "movie-card": {
            if (props.cardType === "movie-list") {
                return (
                    <MovieCard
                        type="movie-list"
                        data={props.data}
                        onPress={props.onPress}
                        style={{ width: "31%" }}
                        hideCreator={props.hideCreator}
                    />
                );
            }
            return (
                <MovieCard
                    type="movie"
                    data={props.data}
                    title={props.data.title}
                    poster={props.data.poster}
                    interactions={{
                        rating: props.data?.rating,
                        isLiked: props.data.isLiked,
                        hasReview: props.data.hasReview,
                        watchCount: (props.data as any).watchCount,
                    }}
                    style={{ width: "31%" }}
                    onPress={props.onPress}
                />
            );
        }
        case "music-card": {
            if (props.cardType === "track") {
                return (
                    <MusicCard
                        type="track"
                        data={props.data}
                        onPress={props.onPress}
                        style={{ width: "31%" }}
                    />
                );
            } else if (props.cardType === "album") {
                return (
                    <MusicCard
                        type="album"
                        data={props.data}
                        onPress={props.onPress}
                        style={{ width: "31%" }}
                    />
                );
            } else if (props.cardType === "playlist") {
                return (
                    <MusicCard
                        type="playlist"
                        data={props.data}
                        onPress={props.onPress}
                        style={{ width: "31%" }}
                        hideCreator={props.hideCreator}
                    />
                );
            }
            return <></>;
        }
        case "user-card": {
            var { data, currentUserId, onFollowPress, onCardPress, isFirst, isLast } = props;
            return (
                <UserCard
                    user={data}
                    currentUserId={currentUserId}
                    onFollowPress={onFollowPress}
                    onCardPress={onCardPress}
                    isFirst={isFirst}
                    isLast={isLast}
                />
            );
        }
        default:
            return <></>;
    }
}
