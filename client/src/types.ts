export type Position = {
  x: number;
  y: number;
};

export type PlayerInfo = {
  id: string;
  position: Position;
  flag?: Flag;
};

export type Flag = {
  teamId: "blue" | "red";
  position: Position;
  color: string;
};
