import { io } from "socket.io-client";

const socket = io("https://social-media-platform-v2.vercel.app", {
  transports: ["websocket"],
  secure: true,
  reconnection: true,
});
export default socket;
