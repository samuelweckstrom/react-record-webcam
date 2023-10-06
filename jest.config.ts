/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  roots: ['<rootDir>/react-record-webcam/'],
  preset: 'ts-jest',
  testEnvironmentOptions: { url: 'http://localhost' },
  transformIgnorePatterns: ['/node_modules/'],
  verbose: true,
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json', 'node'],
  testMatch: [
    '<rootDir>/react-record-webcam/src/__tests__/?(*.)+(spec|test).ts?(x)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
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
