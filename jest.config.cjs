module.exports = {
  preset: "ts-jest",
  // Use the explicit package name so Jest resolves the environment correctly
  testEnvironment: "jest-environment-jsdom",
  roots: ["<rootDir>/tests"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
};
