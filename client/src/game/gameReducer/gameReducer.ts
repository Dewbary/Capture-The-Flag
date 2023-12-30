import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Flag, GameState, PlayerInfo, Position, Score } from "../../types";

const initialState = (): GameState => ({
  clientPlayerId: "",
  players: [],
  flags: [],
  score: {
    red: 0,
    blue: 0,
  },
});

const { reducer, actions } = createSlice({
  name: "game",
  initialState: initialState(),
  reducers: {
    initializeGame: (
      state,
      action: PayloadAction<{
        players: PlayerInfo[];
        flags: Flag[];
        score: Score;
      }>
    ) => {
      const { players, flags, score } = action.payload;
      state.players = players;
      state.flags = flags;
      state.score = score;
    },
    clientPlayerJoined: (
      state,
      action: PayloadAction<{ playerId: string }>
    ) => {
      const { playerId } = action.payload;
      state.clientPlayerId = playerId;
    },
    playerMoved: (
      state,
      action: PayloadAction<{
        playerId: string;
        position: Position;
      }>
    ) => {
      const { playerId, position } = action.payload;
      const player = state.players.find((player) => player.id === playerId);
      if (player) {
        player.position = position;
      }
    },
    updatePlayer: (state, action: PayloadAction<{player: PlayerInfo}>) => {
      const { player } = action.payload;
      state.players = state.players.map((p) => {
        if (p.id === player.id) {
          p = player
        }
        return p;
      })
    },
    flagCaptured: (state, action: PayloadAction<{ player: PlayerInfo, flag: Flag }>) => {
      const { player, flag } = action.payload;

      state.players = state.players.map((p) => {
        if (p.id === player.id) {
          p = player
        }
        return p;
      })

      state.flags = state.flags.map((f) => {
        if (f.teamId === flag.teamId) {
          f = flag
        }
        return f;
      })
    },
    flagMoved: (state, action: PayloadAction<{ flag: Flag }>) => {
      const { flag } = action.payload;
      state.flags = state.flags.map((f) => {
        if (f.teamId === flag.teamId) {
          f = flag
        }
        return f;
      })
    },
    updateFlags: (state, action: PayloadAction<{flags: Flag[]}>) => {
      const { flags } = action.payload;
      state.flags = flags;
    },
    playerJoined: (state, action: PayloadAction<{ player: PlayerInfo }>) => {
      const { player } = action.payload;
      state.players.push(player);
    },
    playerLeft: (state, action: PayloadAction<{ playerId: string }>) => {
      const { playerId } = action.payload;
      state.players = state.players.filter((player) => player.id !== playerId);
    },
    flagDropped: (
      state,
      action: PayloadAction<{
        teamId: "red" | "blue";
        position: { x: number; y: number };
      }>
    ) => {
      const { teamId, position } = action.payload;
      const flag = state.flags.find((flag) => flag.teamId === teamId);
      if (flag) {
        flag.captured = false;
        flag.position = position;
      }
    },
    teamScored: (state, action: PayloadAction<{ teamId: "red" | "blue" }>) => {
      const { teamId } = action.payload;
      state.score[teamId] += 1;
    },
  },
});

export const {
  initializeGame,
  clientPlayerJoined,
  playerJoined,
  playerLeft,
  playerMoved,
  updatePlayer,
  flagCaptured,
  flagMoved,
  flagDropped,
  updateFlags,
  teamScored,
} = actions;
export default reducer;
