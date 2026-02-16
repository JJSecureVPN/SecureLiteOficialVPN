const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const unusedImports = require('eslint-plugin-unused-imports');
const reactPlugin = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'unused-imports': unusedImports,
      react: reactPlugin,
      'react-hooks': reactHooks
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react/react-in-jsx-scope': 'off',
      'deprecation/deprecation': 'off'
    },
    settings: { react: { version: 'detect' } }
  },
  // Avoid type-aware rules on root config/tooling TS files to prevent project/parse errors
  {
    files: ['vitest.config.ts', 'vite.config.ts', 'build-inline.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // no `project` here so typescript-eslint won't require type-aware parsing
        sourceType: 'module'
      }
    },
    plugins: {
      'unused-imports': unusedImports,
      react: reactPlugin
    },
    rules: {
      // keep minimal checks; avoid rules that require type information
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
      ],
      'react/react-in-jsx-scope': 'off'
    },
    settings: { react: { version: 'detect' } }
  },
  // Tests: avoid type-aware parsing (parserOptions.project) to prevent false "file not in project" errors
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'src/**/__tests__/**/*'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // do NOT set `project` here for test files
        sourceType: 'module'
      }
    },
    plugins: { 'unused-imports': require('eslint-plugin-unused-imports'), react: require('eslint-plugin-react') },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
      'react/react-in-jsx-scope': 'off'
    },
    settings: { react: { version: 'detect' } }
  },
  {
    // Avoid type-aware rules on root config/tooling TS files to prevent project/parse errors
    files: ['vitest.config.ts', 'vite.config.ts', 'build-inline.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // no `project` here so typescript-eslint won't require type-aware parsing
        sourceType: 'module'
      }
    },
    plugins: {
      'unused-imports': unusedImports,
      react: reactPlugin
    },
    rules: {
      // keep minimal checks; avoid rules that require type information
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
      ],
      'react/react-in-jsx-scope': 'off'
    },
    settings: { react: { version: 'detect' } }
  }
];
