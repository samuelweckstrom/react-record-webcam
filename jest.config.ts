/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  roots: ['<rootDir>/react-record-webcam/'],
  testEnvironmentOptions: { url: 'http://localhost' },
  transformIgnorePatterns: ['/node_modules/'],
  verbose: true,
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json', 'node'],
  modulePathIgnorePatterns: ['<rootDir>/demo'],
  testMatch: [
    '<rootDir>/react-record-webcam/src/__tests__/?(*.)+(spec|test).ts?(x)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/setupTests.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
};
