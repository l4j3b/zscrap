/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  // ignorePatterns: ["!**/.server", "!**/.client"],

  // Base config
  extends: [
    'eslint:recommended',
    'plugin:drizzle/recommended',
    'plugin:readable-tailwind/warning',
    'plugin:readable-tailwind/error',
  ],

  overrides: [
    // React
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: ['react', 'jsx-a11y', 'readable-tailwind', 'drizzle'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      rules: {
        'readable-tailwind/multiline': ['warn', { printWidth: 100, group: 'newLine' }],
      },
      settings: {
        react: {
          version: 'detect',
        },
        formComponents: ['Form'],
        linkComponents: [
          { name: 'Link', linkAttribute: 'to' },
          { name: 'NavLink', linkAttribute: 'to' },
        ],
        'import/resolver': {
          typescript: {},
        },
      },
    },

    // Typescript
    {
      files: ['**/*.{ts,tsx}'],
      plugins: ['@typescript-eslint', 'import'],
      parser: '@typescript-eslint/parser',
      settings: {
        'import/internal-regex': '^~/',
        'import/resolver': {
          node: {
            extensions: ['.ts', '.tsx'],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/stylistic',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
      ],
      rules: {
        'no-empty-function': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'drizzle/enforce-delete-with-where': 'error',
        'drizzle/enforce-update-with-where': 'error',
        'import/order': [
          'error',
          {
            alphabetize: { caseInsensitive: true, order: 'asc' },
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
          },
        ],
        'padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: '*', next: 'return' }, // Line before return
          { blankLine: 'always', prev: 'import', next: '*' }, // Line after the last import
          { blankLine: 'any', prev: 'import', next: 'import' }, // Allow grouping of imports
          { blankLine: 'always', prev: '*', next: 'block-like' }, // Line before blocks
          { blankLine: 'always', prev: 'block-like', next: '*' }, // Line after blocks
          { blankLine: 'always', prev: '*', next: 'function' }, // Line before function declarations
          { blankLine: 'always', prev: 'function', next: '*' }, // Line after function declarations
        ],
        'no-restricted-imports': ['error', '@remix-run/node'],
        'no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
      },
    },

    // Node
    {
      files: ['.eslintrc.cjs'],
      env: {
        node: true,
      },
    },
  ],
};
