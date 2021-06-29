export const results = [
  {
    source: "path/to/file.css",
    errored: true,
    warnings: [],
    deprecations: [],
    invalidOptionWarnings: [
      {
        text: "Invalid option X for rule Y",
      },
    ],
    ignored: false,
  },
];

export const returnValue = {
  errored: true,
  maxWarningsExceeded: {
    maxWarnings: 0,
    foundWarnings: 0,
  },
};
