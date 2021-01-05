let orderRules = {
  "plugin/rational-order": [
    true,
    {
      "border-in-box-model": false,
      "empty-line-between-groups": true,
    }
  ],
  'order/properties-alphabetical-order': null
};

let bemRules = {
  'plugin/selector-bem-pattern': {
    preset: 'bem',
    presetOptions: {
      namespace: 'app'
    }
  },
  "selector-class-pattern": [
    (() => {
      const WORD = '[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*';

      const ns = `${WORD}-`;
      const block = `${WORD}`;
      const element = `(?:__${WORD})?`;
      const modifier = `(?:(?:_|--)${WORD}){0,2}`;
      const attribute = '(?:\\[.+\\])?';
      return `^${ns}${block}${element}${modifier}${attribute}$`;
    })(),
    {
      "message": "Class names should match the BEM CSS naming convention"
    }
  ]
};

module.exports = {
  extends: [
    'stylelint-config-sass-guidelines',
    'stylelint-config-rational-order'
  ],
  plugins: [
    'stylelint-selector-bem-pattern'
  ],
  rules: {
    ...orderRules,
    ...bemRules,

    'max-nesting-depth': 3,
    'function-parentheses-space-inside': 'never-single-line',
    'block-no-empty': null,
    'color-hex-length': null
  }
};
