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
      const currentUserId = req.user.id;
      const posts = await Post
        .aggregate()
        .match({ _id: ObjectId(req.params.id) })
        .sort({ createdAt: req.query.sort ? parseInt(req.query.sort, 10) : -1 })
        .lookup({
          from: "users", localField: "user", foreignField: "_id", as: "users",
        })
        .lookup({
          from: "comments", localField: "_id", foreignField: "postId", as: "comments",
        })
        .addFields({
          user: { $arrayElemAt: ["$users", 0] },
          likesCount: {
            $size: "$likes",
          },
          commentsCount: {
            $size: "$comments",
          },
          isLikedByCurrentUser: {
            // Searches for intersection between currentUserId and likes (in posts model) array.
            // If current user liked the post
            // then intersection returns array with 1 element
            // and it's size is compared to 1 using $eq expression.
            // The result of "$eq" expression is assigned to a field "isLikedByCurrentUser".
            $eq: [
              {
                $size: {
                  $ifNull: [
                    {
                      $setIntersection: [
                        "$likes",
                        [ObjectId(currentUserId)],
                      ],
                    },
                    [],
                  ],
                },
              },
              1,
            ],
          },
        })
        .project({
          _id: true,
          createdAt: true,
          description: true,
          image: true,
          likesCount: true,
          commentsCount: true,
          isLikedByCurrentUser: true,
          "user._id": true,
          "user.avatar": true,
          "user.username": true,
        });
      if (posts.length === 0) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND);
        return;
      }
      res.status(HTTP_STATUS_CODES.OK).json(posts[0]);
    } catch (error) {
      console.log(error);
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(error);
    }
  }

  async getPosts(req, res) {
    try {
      // UserId query param will appear only when viewing posts of specific user
      const { userId } = req.query;
      const { page } = req.query;
      const POSTS_PER_PAGE = 10;
      const postsTOSkip = (page - 1) * POSTS_PER_PAGE;
      // The signed in user
      const currentUserId = req.user.id;
      const match = {};
      if (userId) {
        match.user = ObjectId(userId);
      } else {
        match.user = { $ne: ObjectId(currentUserId) };
      }
      const posts = await Post
        .aggregate()
        .match(match)
        .sort({ createdAt: req.query.sort ? parseInt(req.query.sort, 10) : -1 })
        .lookup({
          from: "users", localField: "user", foreignField: "_id", as: "users",
        })
        .lookup({
          from: "comments", localField: "_id", foreignField: "postId", as: "comments",
        })
        .addFields({
          user: { $arrayElemAt: ["$users", 0] },
          likesCount: {
            $size: "$likes",
          },
          commentsCount: {
            $size: "$comments",
          },
          isLikedByCurrentUser: {
            // Searches for intersection between currentUserId and likes (in posts model) array.
            // If current user liked the post
            // then intersection returns array with 1 element
            // and it's size is compared to 1 using $eq expression.
            // The result of "$eq" expression is assigned to a field "isLikedByCurrentUser".
            $eq: [
              {
                $size: {
                  $ifNull: [
                    {
                      $setIntersection: [
                        "$likes",
                        [ObjectId(currentUserId)],
                      ],
                    },
                    [],
                  ],
                },
              },
              1,
            ],
          },
        })
        .project({
          _id: true,
          createdAt: true,
          description: true,
          image: true,
          likesCount: true,
          commentsCount: true,
          isLikedByCurrentUser: true,
          "user._id": true,
          "user.avatar": true,
          "user.username": true,
        })
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
      const result = await Post.updateOne(
        filter,
        update,
      );
      if (result.n === 0) {
        res.sendStatus(HTTP_STATUS_CODES.CONFLICT);
        return;
      }
      res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async removeLikes(req, res) {
    try {
      const filter = { _id: ObjectId(req.params.id) };
      const update = { $pull: { likes: ObjectId(req.user.id) } };
      await Post.updateOne(
        filter,
        update,
      );
      res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}

module.exports = new Posts();
