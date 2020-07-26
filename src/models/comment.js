const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

const Comment = new mongoose.model("Comment", {
  user: {
    // required: true,
    type: ObjectId,
    ref: "User",
  },
  postId: {
    type: ObjectId,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

module.exports = Comment;
