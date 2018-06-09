// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // check if imports actually resolve
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.conf.js'
      }
    }
  },
  // add your custom rules here
  'rules': {
    // don't require .vue extension when importing
    'no-lone-blocks': 0,
    'global-require': 0,
    'import/no-unresolved': 0,
    'newline-per-chained-call': [
      0, {
        'ignoreChainWithDepth': true
      }
    ],
    'no-restricted-syntax': [
      2,
      'ForInStatement',
      'LabeledStatement',
      'WithStatement',
    ],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-console': 0,
    'comma-dangle': 0,
    'no-unused-vars': 1,
    'no-param-reassign': 0,
    'no-shadow': 0,
    'no-trailing-spaces': 0,
    'no-underscore-dangle': 0,
    'max-len': [2, 100, 2, {
      'ignoreUrls': true,
      'ignoreComments': true,
      'ignoreStrings': true,
      'ignoreTemplateLiterals': true
    }],
    'import/extensions': ['error', 'never', { // TODO： 从always改到了never
      'js': 'never',
      'vue': 'never'
    }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'prefer-promise-reject-errors': ['off', {
      'allowEmptyReject': true
    }],
    'object-curly-newline': 0
  }
}
