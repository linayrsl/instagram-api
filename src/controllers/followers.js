const HTTP_STATUS_CODES = require("http-status-codes");
const mongoose = require("mongoose");
const Follow = require("../models/follow");

const { ObjectId } = mongoose.Types;

class Followers {
  async createFollow(req, res) {
    const follow = new Follow({
      userId: req.user.id,
      followedUser: req.params.id,
    });
    try {
      const createdFollowRequest = await follow.save();
      res.status(HTTP_STATUS_CODES.CREATED).json(createdFollowRequest);
    } catch (error) {
      console.log(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async unfollowUser(req, res) {
    try {
      await Follow.findOneAndRemove({
        followedUser: ObjectId(req.params.id),
      });
      res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
      console.error(error);
    }
  }

  async getFollowers(req, res) {
    try {
      const followers = await Follow.find({
        followedUser: ObjectId(req.params.id),
      });
      res.status(HTTP_STATUS_CODES.OK).json(followers);
    } catch (error) {
      console.log(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async getFollowing(req, res) {
    try {
      const following = await Follow.find({
        userId: ObjectId(req.params.id),
      });
      res.status(HTTP_STATUS_CODES.OK).json(following);
    } catch (error) {
      console.log(error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}

module.exports = new Followers();
