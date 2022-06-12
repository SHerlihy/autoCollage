const path = require("path");

// const fs = require("fs");
// const entryMap = {};

// fs.readdirSync("./src")
//   .filter((file) => {
//     console.log(file);
//     return file.match(/\.test\.ts?$/);
//   })
//   .forEach((f) => {
//     entryMap[f.replace(/\.test\.ts?$/, "")] = f;
//   });

const creviceFile = "src/addImages/fillCrevices.test.ts";

module.exports = {
  entry: { fillCrevices: `./${creviceFile}` },
  devtool: "inline-source-map",
  output: {
    filename: "tests/[name].js",
    path: path.resolve(__dirname, "build"),
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /(\.ts?$|\.js$)/,
        exclude: [/(node_modules|bower_components)/],
        use: [
          {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
