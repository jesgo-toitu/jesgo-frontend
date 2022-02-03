"use strict";

const path = require("path");

const config = {
  mode: "production",
  entry: './src/index.js',
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    // publicPath: "/"
  },
};

module.exports = config;