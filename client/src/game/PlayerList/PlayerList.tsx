import { PlayerInfo } from "../../types";

type PlayerListProps = {
  playersList: PlayerInfo[];
};

const PlayerList = ({ playersList }: PlayerListProps) => {
  return (
    <div className="absolute top-4 left-4">
      {playersList &&
        playersList.map((player) => {
          return (
            <div key={player.id} className="">
              ID: {player.id}
            </div>
          );
        })}
    </div>
  );
};

export default PlayerList;
