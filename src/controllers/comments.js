const HTTP_STATUS_CODES = require("http-status-codes");
const mongoose = require("mongoose");
const Comment = require("../models/comment");

const { ObjectId } = mongoose.Types;

class Comments {
  async createComment(req, res) {
    const comment = new Comment({
      user: req.user.id,
      postId: req.params.id,
      content: req.body.content,
    });
    try {
      const createdComment = await comment.save();
      res.status(201).json(createdComment);
    } catch (error) {
      res.status(400).json(error);
    }
  }

  async getComments(req, res) {
    try {
      const comments = await Comment
        .find({ postId: req.params.id })
        .populate("user", ["avatar", "username"]);
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

module.exports = new Comments();
