// @ts-check
import eslint from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import jest from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  // Apply strict type checking only to TS files
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Align with strict tsconfig
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
    },
  },
  // Apply recommended rules for .js files (no type checking)
  {
    files: ['**/*.js', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Jest test files
  {
    files: ['**/*.test.ts', '**/*.test.js'],
    ...jest.configs['flat/recommended'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'jest/expect-expect': 'error',
      'jest/no-disabled-tests': 'warn',
      'jest/prefer-to-be': 'error',
    },
  },
  // Import ordering for all files
  {
    plugins: { 'import-x': importX },
    rules: {
      'import-x/order': ['error', {
        'groups': [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index']
        ],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc' }
      }],
      'import-x/no-duplicates': 'error',
    },
  },
  {
    ignores: ['dist/', 'coverage/', 'node_modules/', 'tmp/', 'fetch-all-tabs.js'],
  }
);
