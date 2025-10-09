import { io } from "socket.io-client";

const socket = io("https://social-media-platform-saas.onrender.com", {
  transports: ["websocket"],
  secure: true,
  reconnection: true,
});
export default socket;
