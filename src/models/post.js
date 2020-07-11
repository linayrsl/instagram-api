const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

const Post = new mongoose.model("Post", {
  userId: {
    // required: true,
    type: ObjectId,
  },
  description: String,
  image: {
    type: String,
    required: true,
  },
  likes: [ObjectId],
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});
module.exports = Post;
