export type Brand<K, T extends string> = K & { readonly __brand?: T };

export type UserId = Brand<string, "UserId">;
export type SessionId = Brand<string, "SessionId">;

export type CommentId = Brand<string, "CommentId">;
export type InteractionId = Brand<string, "InteractionId">;
export type BookmarkId = Brand<string, "BookmarkId">;

export type MovieId = Brand<string, "MovieId">;
export type MovieListId = Brand<string, "MovieListId">;
export type WatchedMovieId = Brand<string, "WatchedMovieId">;
export type TmdbId = Brand<number, "TmdbId">;

export type TrackId = Brand<string, "TrackId">;
export type PlaylistId = Brand<string, "PlaylistId">;
export type AlbumId = Brand<string, "AlbumId">;
export type ArtistId = Brand<string, "ArtistId">;

export type SpotifyId = Brand<string, "SpotifyId">;
export type SpotifyTrackId = Brand<string, "SpotifyTrackId">;
export type SpotifyAlbumId = Brand<string, "SpotifyAlbumId">;
export type SpotifyArtistId = Brand<string, "SpotifyArtistId">;

export type PaginationQueries = { page?: number; limit?: number };
export type PaginationResponse = PaginationQueries & { hasMore: boolean };
