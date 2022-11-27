const { defineConfig } = require("cypress");
const config = require('./build/webpack.dev.conf');
module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:8080",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportHeight: 1080,
    viewportWidth: 1920,
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "webpack",
      webpackConfig: config
    },
  },
});
