import { Schema, model, Types } from "mongoose";

export const GENRES = [
  "rock",
  "pop",
  "jazz",
  "hip-hop",
  "classical",
  "emotional",
  "calm",
  "happy",
  "energetic",
  "chill",
  "unknown",
] as const;

type Genre = (typeof GENRES)[number];

export const TAG_CATEGORIES = {
  language: ["hindi", "nepali", "english", "bollywood", "indie"] as const,
  mood: [
    "emotional",
    "calm",
    "energetic",
    "happy",
    "sad",
    "chill",
    "romantic",
    "melancholic",
  ] as const,
  instruments: [
    "guitar",
    "piano",
    "electronic",
    "orchestral",
    "rock",
    "pop",
    "jazz",
    "hip-hop",
    "classical",
  ] as const,
};

type LanguageTag = (typeof TAG_CATEGORIES.language)[number];
type MoodTag = (typeof TAG_CATEGORIES.mood)[number];
type Instruments = (typeof TAG_CATEGORIES.instruments)[number];

type Tags = LanguageTag | MoodTag | Instruments;

export interface Song {
  title: string;
  duration: number;
  artist: string;
  publicId: string;
  fileUrl: string;
  owner?: Types.ObjectId;
  genre: Genre;
  tags?: Tags[];
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const songSchema = new Schema<Song>(
  {
    title: { type: String, required: true, index: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    artist: { type: String, default: "Unknown Artist", trim: true },
    publicId: { type: String, required: true },
    fileUrl: { type: String, required: true },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    genre: {
      type: String,
      enum: GENRES,
      default: "unknown",
    },
    tags: {
      type: [String],
      enum: [
        ...TAG_CATEGORIES.language,
        ...TAG_CATEGORIES.mood,
        ...TAG_CATEGORIES.instruments,
      ],
      default: [],
    },
    playCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Song = model<Song>("Song", songSchema);
export default Song;
