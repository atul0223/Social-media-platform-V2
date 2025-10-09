import dotenv from "dotenv";
import app from "./app.js";
import http from "http"; // ✅ Use HTTP instead of HTTPS
import { Server } from "socket.io";
import connection from "../src/dataBase/dbConnection.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 5000;

connection().then(() => {
  const server = http.createServer(app); // ✅ HTTP server

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
      io.to(chat._id).emit("newMessage", { chat, sender, content });
    });

    socket.on("typing", ({ chatId, user }) => {
      socket.to(chatId).emit("typing", { user, chatId });
    });

    socket.on("stop typing", (chatId) => {
      socket.to(chatId).emit("stop typing", { chatId });
    });

    socket.on("disconnect", () => {
      // Optional cleanup
    });
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server is listening on http://0.0.0.0:${port}`);
  });
});