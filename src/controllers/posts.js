const HTTP_STATUS_CODES = require("http-status-codes");
const Post = require("../models/post");

class Posts {
  async create(req, res) {
    console.log(req.body);
    const post = new Post({
      userId: req.user.id,
      image: req.body.image,
      description: req.body.description,
    });
    try {
      const createdPost = await post.save();
      res.status(201).json(createdPost);
    } catch (error) {
      res.status(400).json(error);
    }
  }

  async getPosts(req, res) {
    try {
      const posts = await Post.find()
        .sort({ createdAt: req.query.sort });
      res.status(HTTP_STATUS_CODES.OK).json(posts);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}

module.exports = new Posts();
