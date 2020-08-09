const HTTP_STATUS_CODES = require("http-status-codes");
const Comment = require("../models/comment");

class Comments {
  async createComment(req, res) {
    const comment = new Comment({
      user: req.user.id,
      postId: req.params.id,
      content: req.body.content,
    });
    try {
      const createdComment = await comment.save();
      res.status(HTTP_STATUS_CODES.CREATED).json(
        await Comment
          // eslint-disable-next-line no-underscore-dangle
          .findById(createdComment._id)
          .populate("user", ["avatar", "username"]),
      );
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
        .populate("user", ["avatar", "username"])
        .skip(commentsToSkip)
        .limit(COMMENTS_PER_PAGE);
      res.status(HTTP_STATUS_CODES.OK).json(comments);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}

module.exports = new Comments();
