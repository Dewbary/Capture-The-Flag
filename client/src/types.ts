export type Position = {
  x: number;
  y: number;
};

export type PlayerInfo = {
  id: string;
  position: Position;
  team: "blue" | "red";
  flag?: Flag;
  captured: boolean;
};

export type Flag = {
  teamId: "blue" | "red";
  position: Position;
  color: string;
  captured: boolean;
};

export type Score = {
  red: number;
  blue: number;
};

export type GameState = {
  clientPlayerId: string;
  players: PlayerInfo[];
  flags: Flag[];
  score: Score;
};

export type Collision = {
  playerId: string;
  position: Position;
  type: "player" | "flag";
  entity: PlayerInfo | Flag;
} | null;
