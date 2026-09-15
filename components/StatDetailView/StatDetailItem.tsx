import { StyleProp, ViewStyle } from "react-native";
import { StatDetailsItemMap, StatType } from "@/types/stat.types";
import DynamicList from "../DynamicList";
import MovieCard from "../MovieCard";
import MusicCard from "../MusicCard";
import UserCard from "../UserCard";
import { StatDetailItemProps } from "./types";
import { GetListsResponseDataItem } from "@/types/movie.types";

export default function StatDetailItem<T extends StatType = StatType>(props: StatDetailItemProps<T>) {
    const layout = props.layout ?? "vertical";
    const cardStyle: StyleProp<ViewStyle> = layout === "horizontal" ? { width: "100%" } : { width: "31%" };

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
                            layout={layout}
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
                        layout={layout}
                        data={props.data}
                        onPress={props.onPress}
                        style={cardStyle}
                        hideCreator={props.hideCreator}
                    />
                );
            }
            return (
                <MovieCard
                    type="movie"
                    layout={layout}
                    data={props.data}
                    title={props.data.title}
                    poster={props.data.poster}
                    interactions={{
                        rating: props.data?.rating,
                        isLiked: props.data.isLiked,
                        hasReview: props.data.hasReview,
                        watchCount: (props.data as any).watchCount,
                    }}
                    style={cardStyle}
                    onPress={props.onPress}
                />
            );
        }
        case "music-card": {
            if (props.cardType === "track") {
                return (
                    <MusicCard
                        type="track"
                        layout={layout}
                        data={props.data}
                        onPress={props.onPress}
                        style={cardStyle}
                    />
                );
            } else if (props.cardType === "album") {
                return (
                    <MusicCard
                        type="album"
                        layout={layout}
                        data={props.data}
                        onPress={props.onPress}
                        style={cardStyle}
                    />
                );
            } else if (props.cardType === "playlist") {
                return (
                    <MusicCard
                        type="playlist"
                        layout={layout}
                        data={props.data}
                        onPress={props.onPress}
                        style={cardStyle}
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
