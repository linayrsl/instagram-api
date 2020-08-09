const express = require("express");
const multer = require("multer");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/posts");
  },
  filename(req, file, cb) {
    const filename = file.originalname.split(".");
    const extension = filename[filename.length - 1];

    function makeString(length) {
      let result = "";
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }
    const result = makeString(9);
    cb(null, `${result}.${extension}`);
  },
});
const upload = multer({ storage });
const users = require("../controllers/users");
const posts = require("../controllers/posts");
const comments = require("../controllers/comments");
const followers = require("../controllers/followers");

const routes = express.Router();

routes.get("/users", users.getAll);
routes.get("/users/current", users.getUserDetails);
routes.get("/users/:id/posts", users.getPostsByUserId);
routes.put("/users/register", users.create);
routes.get("/users/logout", users.logout);
routes.post("/users/login", users.login);
routes.post("/users/validate/email", users.buildValidationHandler("email"));
routes.post("/users/validate/username", users.buildValidationHandler("username"));
routes.get("/users/:id", users.getUser);
routes.post("/user/:id", users.updateUser);
routes.get("/users/:id/stats", users.getStats);

routes.put("/posts", /* upload.single("image"), */ posts.create);
routes.get("/posts", posts.getPosts);
routes.get("/posts/:id", posts.getPostById);
routes.post("/posts/:id/likes", posts.addLikes);
routes.delete("/posts/:id/likes", posts.removeLikes);

routes.put("/posts/:id/comment", comments.createComment);
routes.get("/posts/:id/comment", comments.getComments);

routes.put("/users/:id/follow", followers.createFollow);
routes.get("/users/:id/follow/followers", followers.getFollowers);
routes.get("/users/:id/follow/following", followers.getFollowing);
routes.post("/users/:id/unfollow", followers.unfollowUser);

routes.get("/health", (req, res) => {
  res.send();
});

module.exports = routes;
