/*
 * @Author: EquinoxF
 * @Date: 2021-01-15 12:02:08
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-04 17:17:23
 * @Description:
 * Copyright (c) 2022 by 神兔网络, All Rights Reserved.
 */
module.exports = {
  root: false,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    /**
     *  // "off" or 0 - 关闭规则
        // "warn" or 1 - 将规则视为一个警告（不会影响退出码）
        // "error" or 2 - 将规则视为一个错误 (退出码为1)
     */
    '*': 'off',
    'vue/no-unused-components': 'off',
    'no-trailing-spaces': 0,
    indent: 0,
    'linebreak-style': [0, 'windows'],
    quotes: [2, 'single'],
    semi: [2, 'never'],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-undef': 0,
    'no-unused-vars': 0,
    'no-trailing-spaces': 0,
    'space-before-function-paren': [
      2,
      {
        anonymous: 'always',
        named: 'never'
      }
    ],
    'array-bracket-spacing': 2,
    'block-spacing': [2, 'always'],
    camelcase: 2,
    'no-unused-components': 0,
    'comma-spacing': 2,
    'computed-property-spacing': 2,
    'comma-style': [2, 'last'],
    'consistent-this': 0,
    'key-spacing': 2,
    'keyword-spacing': 2,
    'newline-after-var': 0,
    'no-array-constructor': 2,
    'no-whitespace-before-property': 2,
    'space-infix-ops': 2,
    'space-unary-ops': 2,
    'arrow-spacing': 2,
    'generator-star-spacing': [
      2,
      {
        before: true,
        after: false
      }
    ],
    'no-var': 2,
    'no-trailing-spaces': 2,
    'space-before-blocks': 2,
    'eol-last': 2,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off' //禁止使用debugger
  },
  parserOptions: {
    parser: 'babel-eslint' //此项是用来指定eslint解析器的，解析器必须符合规则，babel-eslint解析器是对babel解析器的包装使其与ESLint解析
  }
}
