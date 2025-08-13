"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../config/env");
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
// ===== CONFIG =====
const API_UPLOAD_ENDPOINT = "http://localhost:3000/api/v1/song/upload";
function uploadFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const form = new form_data_1.default();
        form.append("songs", fs_1.default.createReadStream(filePath));
        try {
            const res = yield axios_1.default.post(API_UPLOAD_ENDPOINT, form, {
                headers: form.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });
            console.log(`Uploaded: ${path_1.default.basename(filePath)} -> ${res.data.message || "success"}`);
        }
        catch (err) {
            console.error(`Failed: ${path_1.default.basename(filePath)} -> ${((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || err.message}`);
        }
    });
}
// ===== WATCHER =====
const watcher = chokidar_1.default.watch(env_1.env.SONG_FOLDER_PATHS, { ignoreInitial: true });
watcher.on("add", (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (filePath.endsWith(".mp3")) {
        console.log(`New song detected: ${path_1.default.basename(filePath)}`);
        const file = [filePath];
        yield uploadFile(filePath);
    }
}));
console.log(`Watching folder: ${env_1.env.SONG_FOLDER_PATHS} for new songs...`);
