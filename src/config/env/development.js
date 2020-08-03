const commonConfig = require("./common");

module.exports = {
  ...commonConfig,
  mongoConnection: "mongodb://localhost:27017/instagram",
  port: 4000,
};
