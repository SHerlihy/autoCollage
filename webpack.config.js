const path = require("path");

const creviceFile = "src/addImages/fillCrevices.test.ts";

module.exports = {
  entry: { fillCrevices: `./${creviceFile}` },
  devtool: "eval-source-map",
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
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env", { targets: "defaults" }]],
              plugins: [
                [
                  "@babel/plugin-transform-modules-commonjs",
                  {
                    loose: true,
                  },
                ],
              ],
            },
          },
          {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true,
            },
          },
        ],
      },
      {
        test: /(\.ts?$|\.js$)/,
        exclude: [/(node_modules|bower_components)/],
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
