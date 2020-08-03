const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("express-jwt");
const routes = require("./config/routes");
const config = require("./config/env/index");

const app = express();
const { port } = config.port;

app.use((cors({
  origin: true,
  credentials: true,
})));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(jwt({
  algorithms: ["HS256"],
  secret: config.secretKey,
  getToken: (req) => {
    if (req.cookies[config.authCookie]) {
      return req.cookies[config.authCookie];
    }
    return null;
  },
}).unless({ path: ["/users/register", "/users/login", "/users/validate/email", "/users/validate/username", "/posts/:id/comment"] }));
app.use(express.static("public"));
app.use(routes);

function listen() {
  app.listen(port, () => console.log(`Running in ${process.env.NODE_ENV || "production"} environment. Server listening on port ${port}!`));
}

function connect() {
  mongoose.connect(config.mongoConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", (err) => console.log(err));
  db.once("open", listen);
}

connect();
