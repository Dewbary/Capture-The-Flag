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
  socket.on("join-game", (player: Player) => {
    console.log("player joined: ", player);

    if (!players.find((p) => p.id === player.id)) {
      players.push(player);
    }
    io.emit("join-game", players, flags);
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

  socket.on("player-moved", (player: Player) => {
    players = players.map((p) => {
      if (p.id === player.id) {
        return player;
      }
      return p;
    });
    socket.broadcast.emit("player-moved", player);
  });

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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("✅ Server listening on port " + PORT);
});
