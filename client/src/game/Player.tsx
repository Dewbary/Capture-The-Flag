import { PlayerInfo } from "../types";

type Props = {
  playerInfo: PlayerInfo;
};

export const Player = ({ playerInfo }: Props) => {
  const { position, flag } = playerInfo;

  return (
    <>
      <div
        className={`absolute w-4 h-4 ${
          playerInfo.team === "red" ? "bg-red-900" : "bg-blue-900"
        } rounded-full`}
        style={{
          top: position.y,
          left: position.x,
          transition: "top 0.3s ease-out, left 0.3s ease-out",
        }}
      />
      {flag && (
        <div
          className="absolute w-48"
          style={{
            top: position.y - 24,
            left: position.x - 4,
            transition: "top 0.3s ease-out, left 0.3s ease-out",
          }}
        >
          Player has the flag!
        </div>
      )}
    </>
  );
};
