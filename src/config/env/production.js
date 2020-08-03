const commonConfig = require("./common");

module.exports = {
  ...commonConfig,
  mongoConnection: process.env.MONGO_URL,
  port: process.env.PORT,
};
