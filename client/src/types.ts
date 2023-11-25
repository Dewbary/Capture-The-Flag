export type Position = {
  x: number;
  y: number;
};

export type PlayerInfo = {
  id: string;
  position: Position;
  team: "blue" | "red";
  flag?: Flag;
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
