import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { Player } from "./Player";
import { Flag, PlayerInfo, Score } from "../types";
import JoinGame from "./JoinGame";
import PlayerList from "./PlayerList";
import Map from "./Map";
import { checkFlagCaptured, checkFlagCollision } from "./gameUtils";
import { produce } from "immer";
import ScoreDisplay from "./ScoreDisplay";

const socket = io(
  // Prod
  "https://brendan-capture-the-flag-302c93083f6a.herokuapp.com",

  // Dev env
  // "http://localhost:3001",
  {
    autoConnect: false,
  }
);
const moveSpeed = 50;

const Game = () => {
  const [clientPlayerState, setClientPlayerState] = useState<PlayerInfo>({
    id: socket.id,
    position: { x: 100, y: 100 },
    team: "blue",
  });

  const [playersList, setPlayersList] = useState<PlayerInfo[]>([]);
  const [joinedGame, setJoinedGame] = useState(false);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [score, setScore] = useState<Score>({ blue: 0, red: 0 });

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

  const handleJoinGameSuccess = (
    players: PlayerInfo[],
    flags: Flag[],
    score: Score
  ) => {
    setPlayersList(players);
    setFlags(flags);
    setScore(score);
  };

  const handleFlagCaptured = (players: PlayerInfo[], updatedflags: Flag[]) => {
    setFlags(updatedflags);
    setPlayersList(players);
  };

  const handleLeaveGame = (players: PlayerInfo[]) => {
    setPlayersList(players);
  };

  const handleScored = (
    updatedScore: Score,
    updatedPlayers: PlayerInfo[],
    updatedFlags: Flag[]
  ) => {
    setScore(updatedScore);
    setPlayersList(updatedPlayers);
    setFlags(updatedFlags);
  };

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

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

    window.addEventListener("keydown", handleKeyPress);
    socket.on("player-moved", handlePlayerMoved);
    socket.on("join-game", handleJoinGameSuccess);
    socket.on("flag-captured", handleFlagCaptured);
    socket.on("scored", handleScored);
    socket.on("leave-game", handleLeaveGame);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      socket.off("player-moved", handlePlayerMoved);
      socket.off("join-game", handleJoinGameSuccess);
      socket.off("flag-captured", handleFlagCaptured);
      socket.off("leave-game", handleLeaveGame);
    };
  }, [clientPlayerState, flags, handleKeyPress, playersList]);

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
      if (flag.captured) return;

      if (
        checkFlagCollision(clientPlayerState.position, flag.position) &&
        !clientPlayerState.flag &&
        flag.teamId !== clientPlayerState.team
      ) {
        setClientPlayerState((prev) => ({
          ...prev,
          flag,
        }));

        const updatedFlags = produce(flags, (draftFlags) => {
          draftFlags.forEach((f) => {
            if (f.teamId === flag.teamId) {
              f.captured = true;
            }
          });
        });

        setFlags(updatedFlags);
        socket.emit("flag-captured", updatedFlags, flag, clientPlayerState);
      }
    });

    if (checkFlagCaptured(clientPlayerState)) {
      if (!clientPlayerState.flag) return;
      const teamId = clientPlayerState.flag?.teamId;

      setScore((prev) => {
        return {
          ...prev,
          [clientPlayerState.team]: prev[clientPlayerState.team] + 1,
        };
      });

      setFlags((prev) => {
        return prev.map((flag) => {
          if (flag.teamId === teamId) {
            return {
              ...flag,
              captured: false,
              position: { x: 800, y: teamId === "red" ? 50 : 750 },
            };
          }
          return flag;
        });
      });

      setClientPlayerState((prev) => {
        return {
          ...prev,
          flag: undefined,
        };
      });

      socket.emit("scored", clientPlayerState.team);
    }
  }, [clientPlayerState, flags]);

  const handleJoinGame = (teamId: "red" | "blue") => {
    setJoinedGame(true);
    setClientPlayerState((prev) => ({ ...prev, id: socket.id, team: teamId }));
    socket.emit("join-game", {
      ...clientPlayerState,
      id: socket.id,
      team: teamId,
    });
  };

  return (
    <div className="h-full w-full">
      <Map flags={flags} />
      <JoinGame handleJoinGame={handleJoinGame} isVisible={!joinedGame} />
      {joinedGame && (
        <>
          <PlayerList playersList={playersList} />
          <ScoreDisplay score={score} />

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
