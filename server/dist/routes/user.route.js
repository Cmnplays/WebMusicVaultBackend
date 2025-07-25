"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRouter = (0, express_1.Router)();
const user_controller_1 = require("../controllers/user.controller");
userRouter.post("/register", user_controller_1.register);
userRouter.post("/login", user_controller_1.login);
userRouter.get("/logout", user_controller_1.logout);
exports.default = userRouter;
