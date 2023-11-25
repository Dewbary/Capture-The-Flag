import { Position } from "../types";

export const checkFlagCollision = (
  playerPosition: Position,
  flagPosition: Position
): boolean => {
  if (!playerPosition || !flagPosition) return false;

  const playerHitbox = {
    x: playerPosition.x,
    y: playerPosition.y,
    size: 50,
  };

  const flagHitbox = {
    x: flagPosition.x,
    y: flagPosition.y,
    size: 15,
  };

  // playerHitbox.x <= flagHitbox.x + flagHitbox.size &&
  // playerHitbox.x + playerHitbox.size >= flagHitbox.x &&
  // playerHitbox.y <= flagHitbox.y + flagHitbox.size &&
  // playerHitbox.y + playerHitbox.size >= flagHitbox.y

  return playerHitbox.x == flagHitbox.x && playerHitbox.y == flagHitbox.y;
};
