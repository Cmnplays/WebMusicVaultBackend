import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import errorMiddleware from "./middlewares/error.middleware";
import invalidRouteMiddleware from "./middlewares/invalidRoute.middleware";

import userRouter from "./routes/user.route";
import songRouter from "./routes/song.route";
import indexRouter from "./routes/index.route";
import consoleRouter from "./miscellaneous/console.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://webmusicvault.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by cors policy"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", indexRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/song", songRouter);
app.use("/api/v1/console", consoleRouter);

//*Global error handler
app.use(errorMiddleware);
app.use(invalidRouteMiddleware);
export default app;
