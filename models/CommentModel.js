var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
  {
    text: { type: String, required: true },
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
