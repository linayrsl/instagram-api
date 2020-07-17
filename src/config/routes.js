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

const routes = express.Router();

routes.get("/users", users.getAll);
routes.get("/users/current", users.getUserDetails);
routes.get("/users/:id/posts", users.getPostsByUserId);
routes.put("/users/register", users.create);
routes.get("/users/logout", users.logout);
routes.post("/users/login", users.login);
routes.post("/users/validate/email", users.buildValidationHandler("email"));
routes.post("/users/validate/username", users.buildValidationHandler("username"));

routes.put("/posts", /* upload.single("image"), */ posts.create);
routes.get("/posts", posts.getPosts);
routes.post("/posts/:id/likes", posts.addLikes);
routes.delete("/posts/:id/likes/", posts.removeLikes);

routes.get("/health", (req, res) => {
  res.send();
});

module.exports = routes;
