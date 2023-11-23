import { PlayerInfo } from "../types";

type Props = {
  playerInfo: PlayerInfo;
};

export const Player = ({ playerInfo }: Props) => {
  const { position } = playerInfo;

  return (
    <div
      className={`absolute w-4 h-4 bg-red-500 rounded-full`}
      style={{
        top: position.y,
        left: position.x,
        transition: "top 0.3s ease-out, left 0.3s ease-out",
      }}
    />
  );
};
