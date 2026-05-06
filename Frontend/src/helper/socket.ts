import { io } from "socket.io-client";

const socket = io("https://loveablebackend-upxgu7d2.b4a.run", {
  transports: ["websocket"],
  secure: true,
  reconnection: true,
});
export default socket;
