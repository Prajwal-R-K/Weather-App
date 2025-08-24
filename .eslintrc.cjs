/* eslint-env node */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  settings: { react: { version: 'detect' } },
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended'
  ],
  plugins: ['react-refresh'],
  ignorePatterns: ['dist', 'coverage'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
  }
}
