"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const songSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    artist: { type: String, default: "Unknown Artist" },
    publicId: { type: String, required: true },
    fileUrl: { type: String, required: true },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
const Song = (0, mongoose_1.model)("Song", songSchema);
exports.default = Song;
