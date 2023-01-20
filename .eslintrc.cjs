module.exports = {
  extends: [
    'standard',
    'plugin:unicorn/recommended',
    'plugin:node/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  ignorePatterns: ['node_modules'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
  },
  plugins: ['security'],
  overrides: [
    {
      files: ['*.graphql'],
      parser: '@graphql-eslint/eslint-plugin',
      plugins: ['@graphql-eslint'],
    },
  ],
  rules: {
    'unicorn/filename-case': 0,
    'unicorn/prefer-module': 0,
    'unicorn/numeric-separators-style': [
      'error',
      { onlyIfContainsSeparator: true },
    ],
    'space-before-function-paren': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'node/exports-style': ['error', 'module.exports'],
    'node/file-extension-in-import': ['error', 'always'],
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/console': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
    'node/prefer-global/url-search-params': ['error', 'always'],
    'node/prefer-global/url': ['error', 'always'],
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',
    'node/no-extraneous-require': [
      'error',
      {
        allowModules: ['@architect/shared'],
      },
    ],
  },
}
