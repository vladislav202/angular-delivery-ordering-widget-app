module.exports = {
  rules: [
    "deprecations-have-a-reason",
    "enum-values-all-caps",
    "enum-values-have-descriptions",
    "fields-are-camel-cased",
    "fields-have-descriptions",
    "input-object-values-are-camel-cased",
    "input-object-values-have-descriptions",
    "relay-connection-types-spec",
    // "relay-connection-arguments-spec",
    "types-are-capitalized",
    "types-have-descriptions"
  ],
  schemaPaths: ['src/**/*.graphqls'],
};
