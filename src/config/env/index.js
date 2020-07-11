const development = require("./development");
const production = require("./production");

let environment = "production";
if (process.env.NODE_ENV === "development") {
  environment = "development";
}

module.exports = environment === "development" ? development : production;
