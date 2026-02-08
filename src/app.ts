import express from "express";
import errorMiddleware from "./middlewares/error.middleware";
const app = express();
import userRouter from "./routes/user.route";
import songRouter from "./routes/song.route";
import cookieParser from "cookie-parser";
import invalidRouteMiddleware from "./middlewares/invalidRoute.middleware";
import indexRouter from "./routes/index.route";
import consoleRouter from "./miscellaneous/console.routes";
import { env } from "./config/env";
import cors from "cors";

const allowedOrigins =
  env.NODE_ENV === "development"
    ? [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://webmusicvault.vercel.app",
      ]
    : [env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by cors policy"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", indexRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/song", songRouter);
app.use("/api/v1/console", consoleRouter); // ✅ ADDED

//*Global error handler
app.use(errorMiddleware);
app.use(invalidRouteMiddleware);
export default app;
