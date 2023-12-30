import { Collision, PlayerInfo, Position } from "../types";

// export const checkCollisions = (playerId: string, playerPosition: Position): Collision[] => {
//   const flagCollision = checkFlagCollision(playerPosition);
//   const playerCollisions = checkPlayerCollision(playerPosition);

//   return [flagCollision, ...playerCollisions];
// }

// export const checkFlagCollision = (
//   playerPosition: Position,
//   flagPosition: Position
// ): Collision => {
//   if (!playerPosition || !flagPosition) return false;

//   const playerHitbox = {
//     x: playerPosition.x,
//     y: playerPosition.y,
//     size: 50,
//   };

//   const flagHitbox = {
//     x: flagPosition.x,
//     y: flagPosition.y,
//     size: 15,
//   };

//   // playerHitbox.x <= flagHitbox.x + flagHitbox.size &&
//   // playerHitbox.x + playerHitbox.size >= flagHitbox.x &&
//   // playerHitbox.y <= flagHitbox.y + flagHitbox.size &&
//   // playerHitbox.y + playerHitbox.size >= flagHitbox.y

//   return playerHitbox.x == flagHitbox.x && playerHitbox.y == flagHitbox.y;
// };

// export const checkPlayerCollision = (): Collision[] => {
//   return [];
// }

export const checkFlagCaptured = (player: PlayerInfo): boolean => {
  if (
    player.team === "blue" &&
    player.flag?.teamId === "red" &&
    player.position.y > 400
  )
    return true;

  if (
    player.team === "red" &&
    player.flag?.teamId === "blue" &&
    player.position.y < 400
  ) {
    return true;
  }
  return false;
};
