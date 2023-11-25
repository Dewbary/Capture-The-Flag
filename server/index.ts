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
  flag?: Flag;
};

type Flag = {
  teamId: "blue" | "red";
  position: Position;
  color: string;
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
let flags: Flag[] = [];

io.on("connection", (socket) => {
  socket.on("join-game", (player: Player) => {
    console.log("player joined: ", player);

    if (!players.find((p) => p.id === player.id)) {
      players.push(player);
    }
    io.emit("join-game", players);
  });

  socket.on("leave-game", (player: Player) => {
    players = players.filter((p) => p.id !== player.id);
    socket.broadcast.emit("leave-game", players);
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
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("✅ Server listening on port " + PORT);
});
