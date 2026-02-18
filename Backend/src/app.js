import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routers/userRouter.js";
import cors from "cors";
import chatRouter from "./routers/chatRouter.js";
import profileRouter from "./routers/profileRouter.js";
import homeRouter from "./routers/homeRouter.js";
import aiRouter from "./routers/aiRouter.js";

const app = express();

const staticAllowedOrigins = [
  "https://social-media-platform-saas.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        staticAllowedOrigins.includes(origin) || localhostRegex.test(origin);

      if (isAllowed) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(json({ limit: "20kb" }));
app.use(urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use("/user", userRouter);
app.use("/profile", profileRouter);
app.use("/home", homeRouter);
app.use("/chat", chatRouter);
app.use("/ai", aiRouter);
app.use((req, res, next) => {
  console.log(`Unhandled request: ${req.method} ${req.originalUrl}`);
  res.status(404).send("Route not found");
});

export default app;
