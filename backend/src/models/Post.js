const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    content: { type: String, required: true, trim: true, maxlength: 20000 },
    author: { type: String, trim: true, maxlength: 80, default: "Anonymous" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);
