import { model, Schema, Types } from "mongoose";

interface Like {
  song: Types.ObjectId;
  playlist: Types.ObjectId;
  likedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const likeSchema = new Schema<Like>(
  {
    song: {
      type: Schema.Types.ObjectId,
      ref: "Song",
    },
    playlist: {
      type: Schema.Types.ObjectId,
      ref: "Playlist",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

likeSchema.index({ song: 1, likedBy: 1 }, { unique: true });
likeSchema.index({ playlist: 1, likedBy: 1 }, { unique: true });

const Like = model<Like>("Like", likeSchema);
export default Like;
