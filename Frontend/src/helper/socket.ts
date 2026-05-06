import { io } from "socket.io-client";

const socket = io("https://loveablebackend-alwryu85.b4a.run", {
  transports: ["websocket"],
  secure: true,
  reconnection: true,
});
export default socket;
