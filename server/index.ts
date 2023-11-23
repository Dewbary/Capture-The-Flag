const express = require("express");
const http = require("http");
import { Server } from "socket.io";

type Position = {
  x: number;
  y: number;
};

type Player = {
  id: string;
  position: Position;
};

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let players: Player[] = [];

io.on("connection", (socket) => {
  socket.on("join-game", (player: Player) => {
    console.log("player joined: ", player);

    if (!players.find((p) => p.id === player.id)) {
      players.push(player);
    }
    io.emit("join-game", players);
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
});

server.listen(3001, () => {
  console.log("✅ Server listening on port 3001");
});
