const HTTP_STATUS_CODES = require("http-status-codes");
const Comment = require("../models/comment");
const pusher = require("../pusher");
const config = require("../config/env/index");

class Comments {
  async createComment(req, res) {
    const comment = new Comment({
      user: req.user.id,
      postId: req.params.id,
      content: req.body.content,
    });
    try {
      let createdComment = await comment.save();
      createdComment = await Comment
        // eslint-disable-next-line no-underscore-dangle
        .findById(createdComment._id)
        .populate("user", ["avatar", "username"]);
      console.log(createdComment);
      pusher.trigger(
        config.pusherChannel,
        "addComment",
        { commentId: createdComment._id, postId: createdComment.postId, userId: req.user.id },
      );
      res.status(HTTP_STATUS_CODES.CREATED).json(createdComment);
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async getComments(req, res) {
    const COMMENTS_PER_PAGE = 10;
    try {
      const { page } = req.query;
      const commentsToSkip = (page - 1) * COMMENTS_PER_PAGE;
      const comments = await Comment
        .find({ postId: req.params.id })
        .sort({ createdAt: -1 })
        .populate("user", ["avatar", "username"])
        .skip(commentsToSkip)
        .limit(COMMENTS_PER_PAGE);
      res.status(HTTP_STATUS_CODES.OK).json(comments);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async getCommentById(req, res) {
    try {
      const { commentId } = req.params;
      const comment = await Comment
        .findById(commentId)
        .populate("user", ["avatar", "username"]);
      res.status(HTTP_STATUS_CODES.OK).json(comment);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}

module.exports = new Comments();
