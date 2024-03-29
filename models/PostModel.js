var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PostSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    photo: { 
      type: Schema.Types.Mixed,
      //type: String, 
      required: true 
    },
    music: { 
      type: String,
      //type: String, 
      required: false 
    },
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
