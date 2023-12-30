import { State } from "../../store";

export const selectClientPlayerId = (state: State) => state.game.clientPlayerId;
export const selectClientPlayer = (state: State) => {
  const playerId = selectClientPlayerId(state);
  return state.game.players.find((player) => player.id === playerId);
};
export const selectClientPlayerPosition = (state: State) => {
  const player = selectClientPlayer(state);
  return player?.position;
};
export const isJoinedGame = (state: State): boolean =>
  !!selectClientPlayerId(state) &&
  !!state.game.players.find((player) => {
    return player.id === selectClientPlayerId(state);
  });

export const selectFlags = (state: State) => state.game.flags;
export const selectScore = (state: State) => state.game.score;
export const selectPlayers = (state: State) => state.game.players;