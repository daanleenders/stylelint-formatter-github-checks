import { checkConclusion } from "./enums/checkConclusion";
import { checkStatus } from "./enums/checkStatus";
import { annotationLevel } from "./enums/annotationLevel";
import { messageSeverity } from "./enums/messageSeverity";

const summaryOfResults = (results) => {
  const summary = results.reduce(
    (total, currentFile) => {
      const fileSummary = currentFile.warnings.reduce(
        (fileTotal, currentWarning) => {
          if (currentWarning.severity === messageSeverity.ERROR) {
            fileTotal.errors++;
          } else {
            fileTotal.warnings++;
          }
          return fileTotal;
        },
        { errors: 0, warnings: 0 }
      );

      total.errors += fileSummary.errors;
      total.warnings += fileSummary.warnings;
      if (currentFile.errored === true) {
        total.filesErrored++;
      }
      if (currentFile.ignored) {
        total.filesIgnored++;
      }
      if (currentFile.deprecations.length > 0) {
        total.deprecations.push(...currentFile.deprecations);
      }
      if (currentFile.invalidOptionWarnings.length > 0) {
        total.invalidOptionWarnings.push(...currentFile.invalidOptionWarnings);
      }
      return total;
    },
    {
      errors: 0,
      warnings: 0,
      filesErrored: 0,
      filesIgnored: 0,
      deprecations: [],
      invalidOptionWarnings: [],
    }
  );
  summary.problems = summary.errors + summary.warnings;
  summary.filesChecked = results.length;

  // Make sure deprecations only contains unique deprecations
  if (summary.deprecations > 1) {
    summary.deprecations = summary.deprecations.filter(
      (element, index) =>
        summary.deprecations.findIndex(
          (compareElement) => compareElement.text === element.text
        ) === index
    );
  }

  // Make sure that only unique invalid option warnings are reported
  if (summary.invalidOptionWarnings > 1) {
    summary.invalidOptionWarnings = summary.invalidOptionWarnings.filter(
      (element, index) =>
        summary.invalidOptionWarnings.findIndex(
          (compareElement) => compareElement.text === element.text
        ) === index
    );
  }

  return summary;
};

function annotationsForResults(results) {
  const files = results.filter((result) => result.warnings.length > 0);
  let annotations = [];

  for (const file of files) {
    for (const warning of file.warnings) {
      const annotation = {
        path: file.source,
        start_line: warning.line,
        end_line: warning.line,
        start_column: warning.column,
        end_column: warning.column,
        annotation_level:
          warning.severity === messageSeverity.ERROR
            ? annotationLevel.FAILURE
            : annotationLevel.WARNING,
        message: warning.text,
        title: warning.rule,
      };

      annotations.push(annotation);

      if (annotations.length === 50) return annotations;
    }
  }

  return annotations;
}

const formatter = (results, returnValue) => {
  const summary = summaryOfResults(results);

  const check = {
    status: checkStatus.COMPLETED,
    completed_at: new Date().toISOString().split(".")[0] + "Z", //Github expects ISO 8601 format without milliseconds
  };

  //No results provided means we haven't checked any files
  if (summary.filesChecked === 0) {
    check.conclusion = checkConclusion.SKIPPED;
    check.output = {
      title: "Nothing to check",
      summary:
        "Stylelint received no files or rules to check. Adjust your Stylelint config to make sure it has files to check" +
        " and rules to check them by",
    };
  } else if (summary.invalidOptionWarnings.length > 0) {
    check.conclusion = checkConclusion.ACTION_REQUIRED;
    check.output = {
      title: "Invalid stylelint config",
      summary: `# Invalid options

`,
    };

    for (const warning of summary.invalidOptionWarnings) {
      check.output.summary += ` - ${warning.text}`;
    }
  } else {
    if (returnValue.errored === false) {
      check.conclusion = checkConclusion.SUCCESS;
    } else {
      check.conclusion = checkConclusion.FAILURE;
    }
    check.output = {
      title: `${summary.problems} problem(s) detected`,
      summary: `${summary.errors} errors and ${summary.warnings} warnings found in ${summary.filesErrored} files.
      ${summary.filesChecked} files checked and ${summary.filesIgnored} files ignored.`,
      text: "",
    };

    if (summary.problems > 50) {
      check.output.text += `## ❗ Annotated only the first 50 problems due to limitations in the Github API
      
      `;
    }

    if (summary.deprecations.length > 0) {
      check.output.text += `## You are using deprecated options in stylelint
      
      `;
      for (const warning of summary.deprecations) {
        check.output.text += ` - ${warning.text} [Learn more](${warning.reference})`;
      }
    }

    check.output.annotations = annotationsForResults(results);
  }

  return JSON.stringify(check);
};

module.exports = formatter;
