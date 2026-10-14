import { IAlbum } from "@/types/album.types";
import { IPlaylist } from "@/types/playlist.types";
import { ITrack } from "@/types/track.types";
import { StyleProp, ViewStyle } from "react-native";

export type MusicCardTrackData = Omit<Partial<ITrack>, "artists"> & {
    title?: string;
    image?: string | URL | null;
    artists?: ({ name?: string } | string)[];
    artistName?: string;
    duration?: number;
    previewImages?: string[];
    album?: { title?: string };
};

export type MusicCardAlbumData = Omit<Partial<IAlbum>, "artists"> & {
    title?: string;
    image?: string | URL | null;
    artists?: ({ name?: string } | string)[];
    artistName?: string;
    releaseYear?: number;
    previewImages?: string[];
};

export type MusicCardPlaylistData = Omit<Partial<IPlaylist>, "creator"> & {
    title?: string;
    image?: string | URL | null;
    creator?: { username?: string };
    songCount?: number;
    previewImages?: string[];
};

type IMusicCardProps<
    TTrack extends MusicCardTrackData = MusicCardTrackData,
    TAlbum extends MusicCardAlbumData = MusicCardAlbumData,
    TPlaylist extends MusicCardPlaylistData = MusicCardPlaylistData,
> = { layout?: "horizontal" | "vertical"; compact?: boolean } & (
    | {
          type: "track";
          data: TTrack;
          onPress?: () => void;
          style?: StyleProp<ViewStyle>;
      }
    | {
          type: "album";
          data: TAlbum;
          onPress?: () => void;
          style?: StyleProp<ViewStyle>;
      }
    | {
          type: "playlist";
          data: TPlaylist;
          onPress?: () => void;
          style?: StyleProp<ViewStyle>;
          hideCreator?: boolean;
      }
);

export { IMusicCardProps };
