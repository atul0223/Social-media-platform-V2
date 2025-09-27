import dotenv from "dotenv";
import app from "./app.js";
import https from "node:https";
import { Server } from "socket.io";
import fs from "fs";
import connection from "../src/dataBase/dbConnection.js";
dotenv.config({
  path: "./.env",
});
const port = process.env.PORT || 5000;
connection().then(() => {
  // const options = {
  //   key: fs.readFileSync("localhost-key.pem"),
  //   cert: fs.readFileSync("localhost.pem"),
  // };

  const server = https.createServer( app);

  const io = new Server(server, {
    cors: {
      origin: "https://loveable-mu.vercel.app",

      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    socket.emit("connected");
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      socket.to(chatId).emit("userJoined", { userId: "user-id" });
    });

    socket.on("sendMessage", ({ chat, content, sender }) => {
      io.to(chat._id).emit("newMessage", {
        chat,
        sender,
        content,
      });
    });

   socket.on("typing", ({ chatId, user }) => {
  socket.to(chatId).emit("typing", { user ,chatId});
});
socket.on("stop typing", (chatId) => {
  socket.to(chatId).emit("stop typing", { chatId });
});


    socket.on("disconnect", () => {
    
    });
  });
server.listen(port, "0.0.0.0", () => {
  console.log(`HTTPS server is listening on port ${port}`);
});

});
