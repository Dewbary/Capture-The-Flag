const express = require("express");
const http = require("http");
const path = require("path");

import { Server } from "socket.io";

type Position = {
  x: number;
  y: number;
};

type Player = {
  id: string;
  position: Position;
  team: "blue" | "red";
  flag?: Flag;
};

type Flag = {
  teamId: "blue" | "red";
  position: Position;
  color: string;
  captured: boolean;
};

type Score = {
  red: number;
  blue: number;
};

export type Collision = {
  playerId: string;
  position: Position;
} | null;

export type FlagCollision = {
  entity: Flag;
  type: "flag"
} | null & Collision;

const app = express();
const server = http.createServer(app);

// const buildPath = path.join(__dirname, "");
app.use(express.static("public"));

app.get("*", function (req: any, res: any) {
  res.sendFile(path.join(__dirname, "/public/index.html"), function (err: any) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let players: Player[] = [];
let flags: Flag[] = [
  {
    teamId: "red",
    position: { x: 800, y: 50 },
    color: "#eb4034",
    captured: false,
  },
  {
    teamId: "blue",
    position: { x: 800, y: 750 },
    color: "#3489eb",
    captured: false,
  },
];
let score: Score = {
  red: 0,
  blue: 0,
};

io.on("connection", (socket) => {
  socket.on("join-game", (playerId: string, teamId: "red" | "blue") => {
    console.log("player joined: ", playerId, teamId);

    if (!players.find((p) => p.id === playerId)) {
      const newPlayer: Player = {
        id: playerId,
        position: { x: 0, y: 0 },
        team: teamId,
      };
      players.push(newPlayer);
      io.emit("player-joined", newPlayer);
    }
    socket.emit("join-game-success", players, flags, score);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    players.forEach((p) => {
      if (p.id === socket.id) {
        if (p.flag) {
          flags = flags.map((f) => {
            if (f.teamId === p.flag?.teamId) {
              f.captured = false;
            }
            return f;
          });
        }
      }
    });
    players = players.filter((p) => p.id !== socket.id);
    socket.broadcast.emit("leave-game", players, flags);
  });

  socket.on(
    "player-moved",
    (playerId: string, direction: "up" | "down" | "left" | "right") => {
      players = players.map((p) => {
        if (p.id === playerId) {
          if (direction === "up") {
            p.position.y -= 50;
          }
          if (direction === "down") {
            p.position.y += 50;
          }
          if (direction === "left") {
            p.position.x -= 50;
          }
          if (direction === "right") {
            p.position.x += 50;
          }
          io.emit("player-moved", playerId, p.position);

          if (p.flag) {
            p.flag.position = p.position;
            io.emit("flag-moved", p.flag)

            // check if the flag has been successfully brought back to base
            if (flagInBase(p.flag)) {
              score[p.team] += 1;
              p.flag = undefined;
              flags = flags.map((f) => {
                if (f.teamId !== p.team) {
                  f.captured = false;
                  f.position = { x: 800, y: f.teamId === "red" ? 50 : 750 };
                }
                return f;
              });

              io.emit("scored", p.team, p, flags);
            }
          }

          const collisions = checkCollisions(p)
        }
        return p;
      });
    }
  );

  socket.on("flag-captured", (flags: Flag[], flag: Flag, player: Player) => {
    console.log("flag captured", flag, player);

    players = players.map((p) => {
      if (p.id === player.id) {
        p = { ...p, flag };
      }
      return p;
    });

    socket.broadcast.emit("flag-captured", players, flags);
  });

  socket.on("scored", (team: "blue" | "red") => {
    console.log("scored", team);
    score[team] += 1;

    players = players.map((p) => {
      if (p.team === team) {
        p.flag = undefined;
      }
      return p;
    });

    flags = flags.map((f) => {
      if (f.teamId === team) {
        f.captured = false;
        f.position = { x: 800, y: team === "red" ? 50 : 750 };
      }
      return f;
    });
    socket.broadcast.emit("scored", score, players, flags);
  });
});


const flagInBase = (flag: Flag) => {
  if (flag.teamId === "blue") {
    return flag.position.y <= 400;
  }

  if (flag.teamId === "red") {
    return flag.position.y >= 400;
  }
}

const checkCollisions = (player: Player) => {
  const flagCollisions = checkFlagCollisions(player);

  flagCollisions.forEach((collision) => {
    if (!collision) return;

    if (collision.entity.captured) return;
    if (collision.entity.teamId === player.team) return;

    collision.entity.captured = true;
    players = players.map((p) => {
      if (p.id === player.id) {
        p.flag = collision.entity;
      }
      return p;
    })

    io.emit("flag-captured", players.find(p => p.id === player.id), collision.entity);
  })

  const playerCollisions = checkPlayerCollisions(player);


  // return [...flagCollisions, ...playerCollisions];
}

const checkFlagCollisions = (player: Player): FlagCollision[] => {
  return flags.map((flag) => {
    if (!player.position || !flag.position) return null;

    if (player.flag === flag) return null;

    const playerHitbox = {
      x: player.position.x,
      y: player.position.y,
      size: 50,
    };

    const flagHitbox = {
      x: flag.position.x,
      y: flag.position.y,
      size: 15,
    };

    // playerHitbox.x <= flagHitbox.x + flagHitbox.size &&
    // playerHitbox.x + playerHitbox.size >= flagHitbox.x &&
    // playerHitbox.y <= flagHitbox.y + flagHitbox.size &&
    // playerHitbox.y + playerHitbox.size >= flagHitbox.y

    if (playerHitbox.x == flagHitbox.x && playerHitbox.y == flagHitbox.y) {
      return {
        playerId: player.id,
        position: player.position,
        type: "flag",
        entity: flag,
      };
    }
    return null;
  });
}

const checkPlayerCollisions = (player: Player): Collision[] => {
  return [];
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("✅ Server listening on port " + PORT);
});
