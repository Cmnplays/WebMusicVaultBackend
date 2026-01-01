import { model, Schema, Types } from "mongoose";
interface Like {
  song: Types.ObjectId;
  likedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const likeSchema = new Schema<Like>(
  {
    song: {
      type: Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Like = model<Like>("Like", likeSchema);
export default Like;
