const HTTP_STATUS_CODES = require("http-status-codes");
const mongoose = require("mongoose");
const Post = require("../models/post");

const { ObjectId } = mongoose.Types;

class Posts {
  async create(req, res) {
    console.log(req.body);
    const post = new Post({
      // user: req.user.id,
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

  async getPosts(req, res) {
    try {
      const posts = await Post
        .find()
        .sort({ createdAt: req.query.sort || 1 })
        .populate("user", ["_id", "avatar", "username"]);

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
      );
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
      );
      console.log(post);
      res.status(HTTP_STATUS_CODES.OK).json(post);
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}

module.exports = new Posts();