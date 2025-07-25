"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const app = (0, express_1.default)();
const user_route_1 = __importDefault(require("./routes/user.route"));
const song_route_1 = __importDefault(require("./routes/song.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const invalidRoute_middleware_1 = __importDefault(require("./middlewares/invalidRoute.middleware"));
const cors_1 = __importDefault(require("cors"));
//*Normal middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
//*Routes
app.use("/api/v1/user", user_route_1.default);
app.use("/api/v1/song", song_route_1.default);
//*Global error handler
app.use(error_middleware_1.default);
app.use(invalidRoute_middleware_1.default);
exports.default = app;
