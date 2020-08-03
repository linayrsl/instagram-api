const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

const Follow = new mongoose.model("Follow", {
  userId: {
    type: ObjectId,
    required: true,
  },
  followedUser: {
    type: ObjectId,
    required: true,
  },
});

module.exports = Follow;
