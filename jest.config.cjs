/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: {
          jsx: 'react-jsx',
          strict: true,
          esModuleInterop: true,
          moduleResolution: 'node',
          module: 'CommonJS',
          types: ['jest', '@testing-library/jest-dom', 'node'],
          noUnusedLocals: false,
          noUnusedParameters: false,
        },
      },
    ],
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/integration/',
    '/tests/e2e/',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/tests/__mocks__/fileMock.cjs',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/tests/__mocks__/fileMock.cjs',
  },
};
