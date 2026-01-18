module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app/**/*.js',
    '!app/**/__tests__/**',
    '!app/**/index.js',
    '!app/test-poland-tax.js',              // CLI script
    '!app/presentation/**',                  // Presentation layer (hard to test, UI concern)
    '!app/services/fetch-spreadsheet.js'    // Utility, not tested
  ],
  testMatch: [
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
