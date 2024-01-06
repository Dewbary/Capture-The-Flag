import { useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { Player } from "./Player";
import { Flag, PlayerInfo, Position, Score } from "../types";
import JoinGame from "./JoinGame";
import PlayerList from "./PlayerList";
import Map from "./Map";
import ScoreDisplay from "./ScoreDisplay";
import { useDispatch, useSelector } from "react-redux";
import {
  clientPlayerJoined,
  initializeGame,
  playerJoined,
  playerMoved,
  flagCaptured,
  flagMoved,
  teamScored,
  updateFlags,
  updatePlayer,
} from "./gameReducer/gameReducer";
import {
  selectClientPlayerId,
  selectScore,
  isJoinedGame,
  selectFlags,
  selectPlayers,
} from "./gameReducer/gameReducerSelectors";

const socket = io(
  // Prod
  // "https://brendan-capture-the-flag-302c93083f6a.herokuapp.com",

  // Dev env
  "http://localhost:3001",
  {
    autoConnect: false,
  }
);

const Game = () => {
  const score = useSelector(selectScore);
  const clientPlayerId = useSelector(selectClientPlayerId);
  const joinedGame = useSelector(isJoinedGame);
  const flags = useSelector(selectFlags);
  const players = useSelector(selectPlayers);
  const dispatch = useDispatch();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!joinedGame) return;
      switch (event.key) {
        case "ArrowUp":
          socket.emit("player-moved", clientPlayerId, "up");
          break;
        case "ArrowDown":
          socket.emit("player-moved", clientPlayerId, "down");
          break;
        case "ArrowLeft":
          socket.emit("player-moved", clientPlayerId, "left");
          break;
        case "ArrowRight":
          socket.emit("player-moved", clientPlayerId, "right");
          break;
      }
    },
    [joinedGame]
  );

  const handleJoinGame = (teamId: "red" | "blue") => {
    socket.emit("join-game", socket.id, teamId);
    dispatch(clientPlayerJoined({ playerId: socket.id }));
  };

  const handleJoinGameSuccess = (
    players: PlayerInfo[],
    flags: Flag[],
    score: Score
  ) => {
    dispatch(initializeGame({ players, flags, score }));
  };

  const handlePlayerJoined = (player: PlayerInfo) => {
    dispatch(playerJoined({ player }));
  };

  const handlePlayerMoved = (playerId: string, position: Position) => {
    dispatch(playerMoved({ playerId, position }));
  };

  const handleFlagCaptured = (player: PlayerInfo, flag: Flag) => {
    dispatch(flagCaptured({ player, flag }));
  };

  const handleFlagMoved = (flag: Flag) => {
    dispatch(flagMoved({ flag }));
  };

  const handlePlayerScored = (
    teamId: "blue" | "red",
    player: PlayerInfo,
    flags: Flag[]
  ) => {
    dispatch(teamScored({ teamId }));
    dispatch(updateFlags({ flags }));
    dispatch(updatePlayer({ player }));
  };

  const handlePlayerCaptured = (player: PlayerInfo) => {
    dispatch(updatePlayer({ player }));
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    socket.on("join-game-success", handleJoinGameSuccess);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-moved", handlePlayerMoved);
    socket.on("flag-captured", handleFlagCaptured);
    socket.on("flag-moved", handleFlagMoved);
    socket.on("scored", handlePlayerScored);
    socket.on("player-captured", handlePlayerCaptured);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      socket.off("player-joined");
      socket.off("player-moved");
      socket.off("join-game-success");
      socket.off("flag-captured");
      socket.off("flag-moved");
      socket.off("scored");
      socket.off("player-captured");
    };
  }, [handleKeyPress]);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-full w-full">
      <Map flags={flags} />

      {!joinedGame ? (
        <JoinGame handleJoinGame={handleJoinGame} />
      ) : (
        <>
          <PlayerList playersList={players} />
          <ScoreDisplay score={score} />

          {players &&
            players.map((player, _index) => (
              <Player key={player.id + _index} playerInfo={player} />
            ))}
        </>
      )}
    </div>
  );
};

export default Game;
