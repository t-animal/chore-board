module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  plugins: [
    '@typescript-eslint',
    'react-hooks'
  ],
  extends: [
    'plugin:react/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },

  settings: {
    react: {
      version: 'detect' // Tells eslint-plugin-react to automatically detect the version of React to use
    }
  },

  globals: {
    'gapi': 'readonly'
  },

  env: {
    'browser': true,
    'es6': true
  },

  rules: {
    'eqeqeq': 'error',
    'no-shadow': ['error', { 'builtinGlobals': true, 'allow': ['event']}],
    'indent': 'off',
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    'no-eq-null': 'error',
    'no-var': 'error',
    'one-var': ['error', 'never'],
    'semi': 'error',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/prefer-interface': 'off',
    'brace-style': 'off',
    '@typescript-eslint/brace-style': [
      'error', '1tbs', { 'allowSingleLine': true }
    ],
    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': [
      'error', { 'before': false, 'after': true }
    ],
    'quotes': 'off',
    '@typescript-eslint/quotes': [
      'error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }
    ],
    '@typescript-eslint/explicit-function-return-type': ['warn', { 'allowExpressions': true }],

    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn' // Checks effect dependencies
  }

};
