const commonConfig = require("./common");

module.exports = {
  ...commonConfig,
  mongoConnection: process.env.MONGO_CONNECTION,
};
