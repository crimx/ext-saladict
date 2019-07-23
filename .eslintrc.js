module.exports = {
  env: {
    browser: true,
    node: true
  },
  extends: [
    'standard',
    'plugin:prettier/recommended',
    'plugin:react/recommended'
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: false
      }
    ],
    yoda: 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'import/first': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-dupe-class-members': 'off'
  },
  globals: {
    browser: true
  }
}
