import * as autoConfig from 'eslint-config-canonical/auto';
import * as browserConfig from 'eslint-config-canonical/browser';
import * as canonicalConfig from 'eslint-config-canonical/canonical';
import * as jsdocConfig from 'eslint-config-canonical/jsdoc';
import * as jsxA11yConfig from 'eslint-config-canonical/jsx-a11y';
import * as nodeConfig from 'eslint-config-canonical/node';
import * as prettierConfig from 'eslint-config-canonical/prettier';
import * as reactConfig from 'eslint-config-canonical/react';
import * as regexpConfig from 'eslint-config-canonical/regexp';
import * as typescriptConfig from 'eslint-config-canonical/typescript';
import * as vitestConfig from 'eslint-config-canonical/vitest';

const overrides = {
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'id-length': 'off',
  'no-console': 'off',
  'no-eq-null': 'off',
  'react/forbid-component-props': 'off',
  'react/prop-types': 'off',
  'canonical/sort-keys': 'off',
  'unicorn/no-array-reduce': 'off',
};

export default [
  { ignores: ['build/**', 'node_modules/**', 'package-lock.json', '**/*.css'] },

  ...autoConfig.default,
  ...browserConfig.recommended,
  ...nodeConfig.recommended,
  ...jsxA11yConfig.recommended,

  {
    rules: {
      ...overrides,
      'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
    },
  },

  {
    files: ['**/*.jsx', '**/*.tsx'],
    rules: {
      ...canonicalConfig.recommended.reduce((acc, c) => ({ ...acc, ...c.rules }), {}),
      ...regexpConfig.recommended.reduce((acc, c) => ({ ...acc, ...c.rules }), {}),
      ...jsdocConfig.recommended.reduce((acc, c) => ({ ...acc, ...c.rules }), {}),
      ...jsxA11yConfig.recommended.reduce((acc, c) => ({ ...acc, ...c.rules }), {}),
      ...reactConfig.recommended.reduce((acc, c) => ({ ...acc, ...c.rules }), {}),
      ...prettierConfig.recommended.reduce((acc, c) => ({ ...acc, ...c.rules }), {}),
      ...overrides,
      'react/no-set-state': 'off',
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      ...typescriptConfig.recommended.reduce((acc, c) => ({ ...acc, ...c.rules }), {}),
      ...prettierConfig.recommended.reduce((acc, c) => ({ ...acc, ...c.rules }), {}),
      ...overrides,
    },
  },

  {
    files: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      ...vitestConfig.recommended.reduce((acc, c) => ({ ...acc, ...c.rules }), {}),
    },
  },
];
