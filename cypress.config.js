const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://semabet.ug/',
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
    },
  },
});
