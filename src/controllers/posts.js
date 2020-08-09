const HTTP_STATUS_CODES = require("http-status-codes");
const mongoose = require("mongoose");
const Post = require("../models/post");

const { ObjectId } = mongoose.Types;

class Posts {
  async create(req, res) {
    const post = new Post({
      user: req.user.id,
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

  async getPostById(req, res) {
    try {
      const post = await Post
        .findById(req.params.id)
        .populate("user", ["avatar", "username"]);
      if (!post) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND);
        return;
      }
      res.status(HTTP_STATUS_CODES.OK).json(post);
    } catch (error) {
      console.log(error);
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(error);
    }
  }

  async getPosts(req, res) {
    try {
      const { userId } = req.query;
      const { page } = req.query;
      const POSTS_PER_PAGE = 10;
      const postsTOSkip = (page - 1) * POSTS_PER_PAGE;
      const query = {};
      if (userId) {
        query.user = userId;
      }
      const posts = await Post
        .find(query)
        .sort({ createdAt: req.query.sort || 1 })
        .populate("user", ["_id", "avatar", "username"])
        .skip(postsTOSkip)
        .limit(POSTS_PER_PAGE);
      res.status(200).json(posts);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

  async addLikes(req, res) {
    try {
      const filter = { _id: ObjectId(req.params.id), likes: { $ne: ObjectId(req.user.id) } };
      const update = { $push: { likes: req.user.id } };
      const post = await Post.findOneAndUpdate(
        filter,
        update,
        {
          new: true,
        },
      )
        .populate("user", ["_id", "avatar", "username"]);
      if (post === null) {
        res.sendStatus(HTTP_STATUS_CODES.CONFLICT);
        return;
      }
      res.status(HTTP_STATUS_CODES.OK).json(post);
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async removeLikes(req, res) {
    try {
      const filter = { _id: ObjectId(req.params.id) };
      const update = { $pull: { likes: ObjectId(req.user.id) } };
      const post = await Post.findOneAndUpdate(
        filter,
        update,
        {
          new: true,
        },
      )
        .populate("user", ["_id", "avatar", "username"]);
      console.log(post);
      res.status(HTTP_STATUS_CODES.OK).json(post);
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}

module.exports = new Posts();
