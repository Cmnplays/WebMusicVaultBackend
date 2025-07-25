import express from "express";
import errorMiddleware from "./middlewares/error.middleware";
const app = express();
import userRouter from "./routes/user.route";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", userRouter);
app.use(errorMiddleware);
export default app;
