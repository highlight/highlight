module.exports = {
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['*.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: `${__dirname}/tsconfig.json`,
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    // Require all external imports to be declared as a dependency
    'import/no-extraneous-dependencies': ['error'],
    // Imports must not cause cyclical dependencies
    'import/no-cycle': ['error'],
    // Imports must be ordered appropriately
    'import/order': [
      'error',
      {
        pathGroups: [
          {
            pattern: '@*/**',
            group: 'parent',
          },
        ],
      },
    ],
    // Imports must be placed before non-import statements
    'import/first': 'error',

    // Disallow console.* calls - these must be explicitly allowed through
    // eslint comments, otherwise we assume they were unintended:
    'no-console': 'error',

    // Favor omitting curly brackets when possible for arrow functions
    'arrow-body-style': ['error', 'as-needed'],
    // Disallow names ending with an underscore_
    'no-underscore-dangle': 'off',
    // Require a space at the start of comments
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['/'],
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
      },
    ],
    // Disallow annotating types where the type can be easily inferred
    '@typescript-eslint/no-inferrable-types': [
      'error',
      {
        ignoreParameters: false,
        ignoreProperties: false,
      },
    ],
    // Allow non-null assertions
    '@typescript-eslint/no-non-null-assertion': 'off',
    // Disallow using 'any' explicitly in annotations
    '@typescript-eslint/no-explicit-any': 'error',
    // Require promise outcomes to be properly handled
    '@typescript-eslint/no-floating-promises': 'error',
    // Disallow unused variables
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-empty-function': 'off',
  },
};
