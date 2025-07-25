import express from "express";
import errorMiddleware from "./middlewares/error.middleware";
const app = express();
import userRouter from "./routes/user.route";
import cookieParser from "cookie-parser";
import cors from "cors";
//*Normal middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

//*Routes
app.use("/api/v1/user", userRouter);

//*Global error handler
app.use(errorMiddleware);
export default app;
