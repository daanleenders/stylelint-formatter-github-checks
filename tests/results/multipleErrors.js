export const results = [
  {
    source: "path/to/file.css",
    errored: true,
    warnings: [
      {
        line: 3,
        column: 12,
        rule: "block-no-empty",
        severity: "error",
        text: "You should not have an empty block (block-no-empty)",
      },
      {
        line: 5,
        column: 11,
        rule: "color-hex-case",
        severity: "warning",
        text: 'Expected "#FFF" to be "#fff"',
      },
    ],
    deprecations: [
      {
        text: "Feature X has been deprecated and will be removed in the next major version.",
        reference: "https://stylelint.io/docs/feature-x.md",
      },
    ],
    invalidOptionWarnings: [],
    ignored: false,
  },
  {
    source: "path/to/file2.css",
    errored: false,
    warnings: [],
    deprecations: [],
    invalidOptionWarnings: [],
    ignored: false,
  },
];

export const returnValue = {
  errored: true,
  maxWarningsExceeded: {
    maxWarnings: 0,
    foundWarnings: 2,
  },
};
