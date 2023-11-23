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
};

const app = express();
const server = http.createServer(app);

const _dirname = path.dirname("");
const buildPath = path.join(_dirname, "../client/build");
app.use(express.static(buildPath));

app.get("/*", function (req: any, res: any) {
  res.sendFile(
    path.join(__dirname, "../client/build/index.html"),
    function (err: any) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("✅ Server listening on port " + PORT);
});
