module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: { project: 'tsconfig.json' },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended'],
  root: true,
  ignorePatterns: ['dist', 'node_modules'],
};
