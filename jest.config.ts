import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app/**/*.ts',
    '!app/**/__tests__/**',
    '!app/**/index.ts',
    '!app/test-poland-tax.ts',           // CLI script
    '!app/presentation/**',                // Presentation layer (UI concern)
    '!app/infrastructure/services/google-sheets/**'  // Google Sheets utility
  ],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

export default config;
