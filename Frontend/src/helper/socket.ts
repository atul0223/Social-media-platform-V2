import { io } from "socket.io-client";

const socket = io("https://loveablebackend-e0mig95j.b4a.run", {
  transports: ["websocket"],
  secure: true,
  reconnection: true,
});
export default socket;
