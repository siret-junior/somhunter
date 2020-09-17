/*
 * Types
 */
export interface Action {
  type: string;
  payload: Song;
}

export interface Song {
  title: string;
  duration: string;
}

export interface StoreState {
  songs: Song[];
  selectedSong: Song;
}
