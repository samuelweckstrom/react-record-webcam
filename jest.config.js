module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/js-with-ts',
  rootDir: __dirname,
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx|js|jsx)?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testPathIgnorePatterns: [
    '/node_modules',
    '.history',
    '/react-css-marquee/dist',
  ],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.json',
    },
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePaths: ['<rootDir>/node_modules'],
};
