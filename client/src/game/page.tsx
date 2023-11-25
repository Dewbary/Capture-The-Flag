import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { Player } from "./Player";
import { Flag, PlayerInfo } from "../types";
import JoinGame from "./JoinGame";
import PlayerList from "./PlayerList";
import Map from "./Map";
import { checkFlagCollision } from "./gameUtils";
import { produce } from "immer";

const socket = io(
  // Prod
  "https://brendan-capture-the-flag-302c93083f6a.herokuapp.com"

  // Dev
  // "http://localhost:3001"
);
const moveSpeed = 50;

const Game = () => {
  const [clientPlayerState, setClientPlayerState] = useState<PlayerInfo>({
    id: socket.id,
    position: { x: 100, y: 100 },
  });
  const [playersList, setPlayersList] = useState<PlayerInfo[]>([]);
  const [joinedGame, setJoinedGame] = useState(false);
  const [flags, setFlags] = useState<Flag[]>([
    {
      teamId: "red",
      position: { x: 800, y: 50 },
      color: "#eb4034",
    },
    {
      teamId: "blue",
      position: { x: 800, y: 750 },
      color: "#3489eb",
    },
  ]);

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

      if (player.flag) {
        const updatedFlags = produce(flags, (draftFlags) => {
          draftFlags.forEach((flag) => {
            if (!player.flag) return;
            if (flag.teamId === player.flag.teamId) {
              flag.position = player.position;
            }
          });
        });
        setFlags(updatedFlags);
      }

      setPlayersList(updatedPlayersList);
    };

    const handleJoinGameSuccess = (players: PlayerInfo[]) => {
      setPlayersList(players);
    };

    const handleFlagCaptured = (players: PlayerInfo[]) => {
      setPlayersList(players);
    };

    window.addEventListener("keydown", handleKeyPress);
    socket.on("player-moved", handlePlayerMoved);
    socket.on("join-game", handleJoinGameSuccess);
    socket.on("flag-captured", handleFlagCaptured);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      socket.off("player-moved", handlePlayerMoved);
      socket.off("join-game", handleJoinGameSuccess);
    };
  }, [handleKeyPress, playersList, flags]);

  useEffect(() => {
    if (!joinedGame) return;
    if (clientPlayerState.flag) {
      const updatedFlags = produce(flags, (draftFlags) => {
        draftFlags.forEach((flag) => {
          if (!clientPlayerState.flag) return;
          if (flag.teamId === clientPlayerState.flag.teamId) {
            flag.position = clientPlayerState.position;
          }
        });
      });
      setFlags(updatedFlags);
    }
    socket.emit("player-moved", clientPlayerState);
  }, [clientPlayerState, joinedGame, flags]);

  useEffect(() => {
    flags.forEach((flag) => {
      if (
        checkFlagCollision(clientPlayerState.position, flag.position) &&
        !clientPlayerState.flag
      ) {
        console.log("flag captured", flag, clientPlayerState);

        setClientPlayerState((prev) => ({
          ...prev,
          flag,
        }));

        socket.emit("flag-captured", flag, clientPlayerState);
      }
    });
  }, [clientPlayerState, flags]);

  const handleJoinGame = () => {
    setJoinedGame(true);
    setClientPlayerState((prev) => ({ ...prev, id: socket.id }));
    socket.emit("join-game", { ...clientPlayerState, id: socket.id });
  };

  return (
    <div className="h-full w-full">
      <Map flags={flags} />
      <JoinGame handleJoinGame={handleJoinGame} isVisible={!joinedGame} />
      {joinedGame && (
        <>
          <PlayerList playersList={playersList} />

          {/* Client Player */}
          <Player playerInfo={clientPlayerState} />

          {/* Other Players */}
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
