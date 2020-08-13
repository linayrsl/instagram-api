const md5 = require("md5");
const HTTP_STATUS_CODES = require("http-status-codes");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;
const User = require("../models/user");
const Post = require("../models/post");
const config = require("../config/env/index");

const ERROR_DUPLICATE_VALUE = 11000;
const DURATION_60D = 60 * 60 * 24 * 60 * 1000;

class Users {
  async getUserDetails(req, res) {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.status(200).json(user);
  }

  buildValidationHandler(type) {
    return async (req, res) => {
      let result = {};
      const valueToSearch = req.body.value;
      try {
        if (type === "username") {
          result = await User.findOne({
            username: valueToSearch,
          });
        } else {
          result = await User.findOne({
            email: valueToSearch,
          });
        }
        if (result) {
          res.sendStatus(HTTP_STATUS_CODES.CONFLICT);
          return;
        }
        res.sendStatus(HTTP_STATUS_CODES.OK);
      } catch (error) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST);
      }
    };
  }

  async getUser(req, res) {
    try {
      const user = await User
        .findById(req.params.id)
        .select(["username", "bio", "createdAt", "avatar"]);
      if (!user) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND);
        return;
      }
      res.status(HTTP_STATUS_CODES.OK).json(user);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(error);
    }
  }

  async getAll(req, res) {
    try {
      const regex = new RegExp(req.query.username || "", "i");
      const users = await User.find({
        username: regex,
      })
        .select(["username", "avatar", "bio"])
        .limit(10);
      res.json(users);
    } catch (error) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  }

  async getStats(req, res) {
    // The signed in user
    const currentUserId = req.user.id;
    console.log(currentUserId);
    // The user that we looking at
    const profileId = req.params.id;
    try {
      const userStats = await User
        .aggregate()
        .match({ _id: { $eq: ObjectId(profileId) } })
        .lookup({
          from: "posts", localField: "_id", foreignField: "user", as: "posts",
        })
        .lookup({
          from: "follows", localField: "_id", foreignField: "userId", as: "following",
        })
        .lookup({
          from: "follows", localField: "_id", foreignField: "followedUser", as: "followers",
        })
        .addFields({
          postsCount: {
            $size: "$posts",
          },
          followsCount: {
            $size: "$following",
          },
          followersCount: {
            $size: "$followers",
          },
          isFollowedByCurrentUser: {
            // Searches for intersection between currentUserId and followers array.
            // If current user is following the profile
            // then intersection returns array with 1 element
            // and it's size is compared to 1 using $eq expression.
            // The result of "$eq" expression is assigned to a field "isFollowedByCurrentUser".
            $eq: [
              {
                $size: {
                  $ifNull: [
                    {
                      $setIntersection: [
                        {
                          // Mapping followers array to array of ObjectIds
                          // in order to be able match against current user ObjectId.
                          $map:
                            {
                              input: "$followers",
                              as: "follower",
                              in: "$$follower.userId",
                            },
                        },
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
          postsCount: true,
          followsCount: true,
          followersCount: true,
          isFollowedByCurrentUser: true,
        });
      res.json(userStats[0]);
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  }

  async logout(req, res) {
    res.clearCookie(config.authCookie);
    res.sendStatus(200);
  }

  async login(req, res) {
    const userToSearch = req.body;
    try {
      const user = await User.findOne({
        username: userToSearch.username,
        password: md5(userToSearch.password),
      });
      if (!user) {
        res.sendStatus(401);
        return;
      }
      const token = jwt.sign({ id: user._id.toString() }, config.secretKey, { expiresIn: "1d" });
      console.log(user);
      res.status(200).json({ ...user.toObject(), token });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }

  async create(req, res) {
    const newUser = new User(req.body);
    newUser.password = md5(newUser.password);
    try {
      const createdUser = await newUser.save();
      res.status(201).json(createdUser);
    } catch (error) {
      if (error.code === ERROR_DUPLICATE_VALUE) {
        res.sendStatus(409);
        return;
      }
      res.status(400).json(error);
    }
  }

  async updateUser(req, res) {
    try {
      // const userId = req.user.id;
      const filter = { _id: ObjectId(req.params.id) };
      const update = { avatar: req.body.image, bio: req.body.biography };
      const user = await User.findOneAndUpdate(
        filter,
        update,
        {
          new: true,
        },
      );
      res.status(HTTP_STATUS_CODES.OK).json(user);
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async getPostsByUserId(req, res) {
    try {
      const posts = await Post.find({
        user: ObjectId(req.params.id),
      })
        .populate("user", ["_id", "avatar", "username"])
        .sort({ createdAt: req.query.sort || 1 });
      res.status(HTTP_STATUS_CODES.OK).json(posts);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = new Users();
