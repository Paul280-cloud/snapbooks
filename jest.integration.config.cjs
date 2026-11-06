/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: {
          strict: true,
          esModuleInterop: true,
          moduleResolution: 'node',
          module: 'CommonJS',
          noUnusedLocals: false,
          noUnusedParameters: false,
          noUncheckedSideEffectImports: false,
        },
      },
    ],
  },
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
};
