const Pusher = require("pusher");
const config = require("./config/env/index");

const pusher = new Pusher({
  appId: config.pusherAppId,
  key: config.pusherKey,
  secret: config.pusherSecret,
  cluster: config.pusherCluster,
  encrypted: true,
});

module.exports = pusher;
