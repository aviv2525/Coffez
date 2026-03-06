var globals = require('globals');

module.exports = [
  { ignores: ['dist/', 'node_modules/'] },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: { project: 'tsconfig.json' },
      globals: { ...globals.node, ...globals.jest },
    },
    plugins: { '@typescript-eslint': require('@typescript-eslint/eslint-plugin') },
    rules: {
      ...require('@eslint/js').configs.recommended.rules,
      'no-unused-vars': ['error', { args: 'none', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
