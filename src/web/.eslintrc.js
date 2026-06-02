const overrides = {
  eqeqeq: ['error', 'always', { null: 'ignore' }], // noisy
  'id-length': 'off', // noisy
  'no-console': 'off', // noisy
  'no-eq-null': 'off', // noisy
  'react/forbid-component-props': 'off', // noisy
  'react/prop-types': 'off', // noisy
  'canonical/sort-keys': 'off', // noisy
  'unicorn/no-array-reduce': 'off', // noisy
};

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['canonical/auto', 'canonical/browser', 'canonical/node'],
  ignorePatterns: ['build', 'node_modules', 'package-lock.json'],
  overrides: [
    {
      extends: [
        'canonical',
        'canonical/regexp',
        'canonical/jsdoc',
        'canonical/jsx-a11y',
        'canonical/react',
        'canonical/prettier',
      ],
      files: ['*.jsx', '*.tsx'],
      parserOptions: {
        babelOptions: {
          parserOpts: {
            plugins: ['jsx'],
          },
        },
      },
      rules: {
        ...overrides,
        'react/no-set-state': 'off', // only useful when using state libs
      },
    },
    {
      extends: ['canonical/typescript', 'canonical/prettier'],
      files: ['*.ts', '*.tsx'],
      rules: {
        ...overrides,
      },
    },
    {
      extends: ['canonical/jest'],
      files: '*.test.{js,jsx,ts,tsx}',
    },
  ],
  root: true,
  rules: {
    ...overrides,

    'import/no-unassigned-import': [
      'error',
      {
        allow: ['semantic-ui-less/semantic.less', '**/*.css'],
      },
    ],
  },
};
