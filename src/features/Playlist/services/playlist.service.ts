import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  AddSongToPlaylistResponse,
  AddSongToPlaylistsPayload,
  AddSongToPlaylistsResponse,
  CreatePlaylistPayload,
  Playlist,
  PlaylistResponse,
  PlaylistSongPayload,
  PlaylistSongSort,
  PlaylistsContainingSongResponse,
  PlaylistsParams,
  PlaylistsResponse,
  RemoveSongFromPlaylistResponse,
  UpdatePlaylistPayload,
} from "../types/playlist.types";

export async function getPlaylists(
  params?: PlaylistsParams
): Promise<PlaylistsResponse> {
  const { data } = await apiClient.get<PlaylistsResponse>(
    endpoints.playlists.list,
    { params }
  );
  return data;
}

export async function getPlaylist(
  id: string,
  sort?: PlaylistSongSort
): Promise<Playlist> {
  const { data } = await apiClient.get<PlaylistResponse>(
    endpoints.playlists.item(id),
    { params: sort ? { sort } : undefined }
  );
  return data.data;
}

export async function createPlaylist(
  payload: CreatePlaylistPayload
): Promise<Playlist> {
  const { data } = await apiClient.post<PlaylistResponse>(
    endpoints.playlists.list,
    payload
  );
  return data.data;
}

export async function updatePlaylist(
  id: string,
  payload: UpdatePlaylistPayload
): Promise<Playlist> {
  const { data } = await apiClient.patch<PlaylistResponse>(
    endpoints.playlists.item(id),
    payload
  );
  return data.data;
}

export async function deletePlaylist(id: string) {
  const { data } = await apiClient.delete<{
    data: { id: string; deleted: boolean };
    error: Record<string, unknown>;
    isSuccess: boolean;
  }>(endpoints.playlists.item(id));
  return data.data;
}

export async function addSongToPlaylist(
  playlistId: string,
  payload: PlaylistSongPayload
) {
  const { data } = await apiClient.post<AddSongToPlaylistResponse>(
    endpoints.playlists.addSong(playlistId),
    payload
  );
  return data.data;
}

export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string
) {
  const { data } = await apiClient.delete<RemoveSongFromPlaylistResponse>(
    endpoints.playlists.removeSong(playlistId, songId)
  );
  return data.data;
}

export async function addSongToPlaylists(payload: AddSongToPlaylistsPayload) {
  const { data } = await apiClient.post<AddSongToPlaylistsResponse>(
    endpoints.playlists.addSongBulk,
    payload
  );
  return data.data;
}

export async function getPlaylistsContainingSong(
  songId: string
): Promise<string[]> {
  const { data } = await apiClient.get<PlaylistsContainingSongResponse>(
    endpoints.playlists.containing(songId)
  );
  return data.data.playlistIds;
}
