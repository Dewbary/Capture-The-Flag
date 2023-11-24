import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { Player } from "./Player";
import { PlayerInfo } from "../types";

const socket = io(
  "https://brendan-capture-the-flag-302c93083f6a.herokuapp.com:3001"
);
const moveSpeed = 50;

const Game = () => {
  const [clientPlayerState, setClientPlayerState] = useState<PlayerInfo>({
    id: socket.id,
    position: { x: 100, y: 100 },
  });
  const [playersList, setPlayersList] = useState<PlayerInfo[]>([]);
  const [joinedGame, setJoinedGame] = useState(false);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!joinedGame) return;

      switch (event.key) {
        case "ArrowUp":
          setClientPlayerState((prev) => ({
            ...prev,
            position: { ...prev.position, y: prev.position.y - moveSpeed },
          }));
          break;
        case "ArrowDown":
          setClientPlayerState((prev) => ({
            ...prev,
            position: { ...prev.position, y: prev.position.y + moveSpeed },
          }));
          break;
        case "ArrowLeft":
          setClientPlayerState((prev) => ({
            ...prev,
            position: { ...prev.position, x: prev.position.x - moveSpeed },
          }));
          break;
        case "ArrowRight":
          setClientPlayerState((prev) => ({
            ...prev,
            position: { ...prev.position, x: prev.position.x + moveSpeed },
          }));
          break;
      }
    },
    [joinedGame]
  );

  useEffect(() => {
    const handlePlayerMoved = (player: PlayerInfo) => {
      const updatedPlayersList = [
        ...playersList.filter((p) => p.id !== player.id),
        player,
      ];
      setPlayersList(updatedPlayersList);
    };

    const handleJoinGameSuccess = (players: PlayerInfo[]) => {
      setPlayersList(players);
    };

    window.addEventListener("keydown", handleKeyPress);
    socket.on("player-moved", handlePlayerMoved);
    socket.on("join-game", handleJoinGameSuccess);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      socket.off("player-moved", handlePlayerMoved);
      socket.off("join-game", handleJoinGameSuccess);
    };
  }, [handleKeyPress, playersList]);

  useEffect(() => {
    if (!joinedGame) return;
    socket.emit("player-moved", clientPlayerState);
  }, [clientPlayerState, joinedGame]);

  const handleJoinGame = () => {
    setJoinedGame(true);
    setClientPlayerState((prev) => ({ ...prev, id: socket.id }));
    socket.emit("join-game", { ...clientPlayerState, id: socket.id });
  };

  return (
    <div className="h-screen w-full">
      <button
        className="p-4 rounded border-2 border-black absolute top-[50%] left-[50%] text-black"
        onClick={handleJoinGame}
      >
        Join Game
      </button>

      {joinedGame && (
        <>
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

          <Player playerInfo={clientPlayerState} />
          {playersList &&
            playersList.map((player, _index) => {
              if (player.id === socket.id) return null;
              return <Player key={player.id + _index} playerInfo={player} />;
            })}
        </>
      )}
    </div>
  );
};

export default Game;
