import { State } from "../../store";
import { Collision, Flag, Position } from "../../types";
import { createSelector } from "@reduxjs/toolkit";

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

// export const selectPlayerCollisions = createSelector(
//   [selectClientPlayerPosition, selectPlayers],
//   (playerPosition, players): Collision[] => {
//     return [];
//   }
// );

// export const checkFlagCollisions = (
//   playerId: string,
//   playerPosition: Position,
//   flags: Flag[]
// ): Collision[] => {
//   return flags.map((flag) => {
//     if (!playerPosition || !flag.position) return null;

//     const playerHitbox = {
//       x: playerPosition.x,
//       y: playerPosition.y,
//       size: 50,
//     };

//     const flagHitbox = {
//       x: flag.position.x,
//       y: flag.position.y,
//       size: 15,
//     };

//     // playerHitbox.x <= flagHitbox.x + flagHitbox.size &&
//     // playerHitbox.x + playerHitbox.size >= flagHitbox.x &&
//     // playerHitbox.y <= flagHitbox.y + flagHitbox.size &&
//     // playerHitbox.y + playerHitbox.size >= flagHitbox.y

//     if (playerHitbox.x == flagHitbox.x && playerHitbox.y == flagHitbox.y) {
//       return {
//         playerId: playerId,
//         position: playerPosition,
//         type: "flag",
//         entity: flag,
//       };
//     }
//     return null;
//   });
// };

// export const getCollisions = createSelector(
//   [
//     selectClientPlayerId,
//     selectClientPlayerPosition,
//     selectFlags,
//     selectPlayers,
//   ],
//   (playerId, playerPosition, flags, players): Collision[] => {
//     if (!playerPosition) return [];
//     const flagCollisions = checkFlagCollisions(playerId, playerPosition, flags);
//     const playerCollisions = checkPlayerCollisions(
//       playerId,
//       playerPosition,
//       players
//     );

//     return [...flagCollisions, ...playerCollisions];
//   }
// );

// export const checkPlayerCollisions = (
//   playerId: string,
//   playerPosition: Position,
//   players: PlayerInfo[]
// ): Collision[] => {
//   return [];
// };
