const path = require("path");

class StubableExportsPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "StubableExportsPlugin",
      (compilation, params) => {
        compilation.hooks.buildModule.tap(
          "StubableExportsPlugin",
          function (module) {
            if (new RegExp("/fillCrevices.test").exec(module.rawRequest)) {
              return;
            }

            module.loaders.push({
              loader: path.resolve(__dirname, "./stubableImportsLoader.js"),
              options: {},
            });
          }
        );
      }
    );
  }
}

module.exports = StubableExportsPlugin;
