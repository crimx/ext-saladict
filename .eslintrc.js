module.exports = {
  env: {
    browser: true,
    node: true,
    'jest/globals': true
  },
  extends: [
    'standard',
    'plugin:prettier/recommended',
    'plugin:react/recommended'
  ],
  plugins: ['@typescript-eslint', 'jest'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { args: 'none', ignoreRestSiblings: true }
    ],
    'dot-notation': 'off',
    'import/first': 'off',
    'import/no-webpack-loader-syntax': 'off',
    'no-dupe-class-members': 'off',
    'no-unused-vars': 'off',
    'no-useless-return': 'off',
    'prefer-promise-reject-errors': 'off',
    'prettier/prettier': ['error', { singleQuote: true, semi: false }],
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'standard/computed-property-even-spacing': 'off',
    'standard/no-callback-literal': 'off',
    camelcase: 'off',
    yoda: 'off'
  },
  globals: {
    browser: true
  }
}
