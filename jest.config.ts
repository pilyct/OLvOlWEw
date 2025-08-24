// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/__tests__/**/*.(test|spec).(ts|tsx)"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
  moduleDirectories: ["node_modules", "src"],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;
