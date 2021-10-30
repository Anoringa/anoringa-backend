var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    categoryName: { type: String, required: true },
    isAdultContent: { type: Boolean, required: false, default: 0},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
