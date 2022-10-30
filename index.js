const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const res = require("express/lib/response");


const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static("public"));

let numClients = 0;


io.on("connection", (socket) => {
    console.log("A user connected!", socket.id);
    console.log(numClients);
    if (numClients >= 2) {
        socket.emit("full");
    }

    numClients ++;


    socket.on("disconnecting", () => {
        console.log(socket.id, "disconnecting");
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected!", socket.id);
        numClients --;
    });

    socket.on("position", (x, y) => {
        socket.broadcast.emit("position", x, y);
    });
    socket.on("axe", (x, y) => {
        socket.broadcast.emit("axe", x, y);
    });
    socket.on("map", (mapNum) => {
        io.emit("map", mapNum);
    });
    socket.on("chat", (msg) => {
        socket.broadcast.emit("chat", msg);
    });
});


server.listen(PORT, () => {
    console.log("Listening on port", PORT);
});
