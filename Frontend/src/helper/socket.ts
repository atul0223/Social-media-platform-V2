import { io } from "socket.io-client";

const socket = io("https://loveablebackend-hbyj0cin.b4a.run", {
  transports: ["websocket"],
  secure: true,
  reconnection: true,
});
export default socket;
