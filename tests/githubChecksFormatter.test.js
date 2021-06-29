import githubChecksFormatter from "../src/githubChecksFormatter";
import { checkConclusion } from "../src/enums/checkConclusion";
import checkStatus from "../src/enums/checkStatus";
import {
  results as errorResults,
  returnValue as errorReturnValue,
} from "./results/multipleErrors";
import {
  results as invalidResults,
  returnValue as invalidReturnValue,
} from "./results/invalidConfig";
import {
  results as successResults,
  returnValue as successReturnValue,
} from "./results/success";

describe("current time", () => {
  const expectedDate = "2021-06-29T15:53:19Z";
  const RealDate = Date;
  let outputJson;

  function mockDate(isoDate) {
    global.Date = class extends RealDate {
      constructor() {
        super();
        return new RealDate(isoDate);
      }
    };
  }

  beforeAll(() => {
    mockDate(expectedDate);

    const output = githubChecksFormatter([]);
    outputJson = JSON.parse(output);

    global.Date = RealDate;
  });

  it("should be returned in 'completed_at'", () => {
    expect(outputJson).toHaveProperty("completed_at", expectedDate);
  });
});

describe("given no linted files (empty result set), the check", () => {
  let outputJson;

  beforeAll(() => {
    const output = githubChecksFormatter([]);
    outputJson = JSON.parse(output);
  });

  test("should return any output", () => {
    expect(outputJson).toBeDefined();
  });

  it("should have all required parameters", () => {
    expect(outputJson).toHaveProperty("status", checkStatus.COMPLETED);
    expect(outputJson).toHaveProperty("completed_at");
    expect(outputJson).toHaveProperty("conclusion");
    expect(outputJson).toHaveProperty("output");
    expect(outputJson).toHaveProperty("output.title");
    expect(outputJson).toHaveProperty("output.summary");
  });

  it("should be 'skipped'", () => {
    expect(outputJson).toHaveProperty("conclusion", checkConclusion.SKIPPED);
  });
});

describe("given no errors, the check", () => {
  let outputJson;

  beforeAll(() => {
    const output = githubChecksFormatter(successResults, successReturnValue);
    outputJson = JSON.parse(output);
  });

  test("should return any output", () => {
    expect(outputJson).toBeDefined();
  });

  it("should have all required parameters", () => {
    expect(outputJson).toHaveProperty("status", checkStatus.COMPLETED);
    expect(outputJson).toHaveProperty("completed_at");
    expect(outputJson).toHaveProperty("conclusion");
    expect(outputJson).toHaveProperty("output");
    expect(outputJson).toHaveProperty("output.title");
    expect(outputJson).toHaveProperty("output.summary");
  });

  test("should be a 'success'", () => {
    expect(outputJson).toHaveProperty("conclusion", checkConclusion.SUCCESS);
  });
});

describe("given an invalid stylelint config", () => {
  let outputJson;

  beforeAll(() => {
    const output = githubChecksFormatter(invalidResults, invalidReturnValue);
    outputJson = JSON.parse(output);
  });

  test("should return any output", () => {
    expect(outputJson).toBeDefined();
  });

  it("should have all required parameters", () => {
    expect(outputJson).toHaveProperty("status", checkStatus.COMPLETED);
    expect(outputJson).toHaveProperty("completed_at");
    expect(outputJson).toHaveProperty("conclusion");
    expect(outputJson).toHaveProperty("output");
    expect(outputJson).toHaveProperty("output.title");
    expect(outputJson).toHaveProperty("output.summary");
  });

  test("should conclude that an action is required", () => {
    expect(outputJson).toHaveProperty(
      "conclusion",
      checkConclusion.ACTION_REQUIRED
    );
  });

  test("should not return annotations", () => {
    expect(outputJson).not.toHaveProperty("output.annotations");
  });
});

describe("given multiple errors, the check", () => {
  let outputJson;

  beforeAll(() => {
    const output = githubChecksFormatter(errorResults, errorReturnValue);
    outputJson = JSON.parse(output);
  });

  test("should return any output", () => {
    expect(outputJson).toBeDefined();
  });

  it("should have all required parameters", () => {
    expect(outputJson).toHaveProperty("status", checkStatus.COMPLETED);
    expect(outputJson).toHaveProperty("completed_at");
    expect(outputJson).toHaveProperty("conclusion");
    expect(outputJson).toHaveProperty("output");
    expect(outputJson).toHaveProperty("output.title");
    expect(outputJson).toHaveProperty("output.summary");
  });

  test("should be a 'failure'", () => {
    expect(outputJson).toHaveProperty("conclusion", checkConclusion.FAILURE);
  });

  test("should return annotations", () => {
    expect(outputJson).toHaveProperty("output.annotations");
    expect(outputJson.output.annotations).toHaveLength(2);
  });

  test("'s annotations should have all required parameters", () => {
    expect(outputJson.output.annotations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.any(String),
          start_line: expect.any(Number),
          end_line: expect.any(Number),
          annotation_level: expect.any(String),
          message: expect.any(String),
        }),
      ])
    );
  });

  test("'s annotations start an end line/column should match", () => {
    for (const { start_line, end_line, start_column, end_column } of outputJson
      .output.annotations) {
      expect(start_line).toBe(end_line);
      expect(start_column).toBe(end_column);
    }
  });
});
