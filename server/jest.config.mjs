// jest.config.mjs
export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/jestSetup.js"],
  transform: {}, // run as native ESM (no transform)
  testTimeout: 60000,
};
