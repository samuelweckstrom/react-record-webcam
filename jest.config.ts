/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  roots: ['<rootDir>/react-record-webcam/'],
  preset: 'ts-jest',
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
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: 'jest.tsconfig.json',
      },
    ],
  },
};
