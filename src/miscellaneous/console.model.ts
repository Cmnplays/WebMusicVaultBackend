import mongoose, { Document, Schema } from "mongoose";

export type ConsoleMode = "text" | "photo" | "audio" | "video";

export interface IConsoleEntry extends Document {
  mode: ConsoleMode;
  timestamp: Date;
  text?: string;
  photos?: {
    url: string;
    publicId: string;
    originalName: string;
    mimeType: string;
    size: number;
  }[];
  audio?: {
    url: string;
    publicId: string;
    originalName: string;
    mimeType: string;
    size: number;
  };
  video?: {
    url: string;
    publicId: string;
    originalName: string;
    mimeType: string;
    size: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const consoleEntrySchema = new Schema<IConsoleEntry>(
  {
    mode: {
      type: String,
      enum: ["text", "photo", "audio", "video"],
      required: true,
    },
    timestamp: { type: Date, required: true },
    text: { type: String },

    photos: {
      type: [fileSchema],
      default: undefined,
    },

    audio: {
      type: fileSchema,
      required: false,
    },

    video: {
      type: fileSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ConsoleEntry = mongoose.model<IConsoleEntry>(
  "ConsoleEntry",
  consoleEntrySchema
);

export default ConsoleEntry;
