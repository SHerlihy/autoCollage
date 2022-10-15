import { defineConfig } from "cypress";
const webpackPreprocessor = require("@cypress/webpack-preprocessor");

export default defineConfig({
  e2e: {
    supportFile: false,
    specPattern: "./build/tests/*.js",
    // supportFile: false,
    // devServer: {
    //   framework: "create-react-app",
    //   bundler: "webpack",
    // },

    // setupNodeEvents(on) {
    //   const options = {
    //     // send in the options from your webpack.config.js, so it works the same
    //     // as your app's code
    //     webpackOptions: require("./webpack.config"),
    //     watchOptions: {},
    //   };
    //   on("file:preprocessor", webpackPreprocessor(options));
    // },
  },
});
