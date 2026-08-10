import { toPlainStringHeaders } from "../Utils/generics";
import { extractUrlFromText } from "../Utils/messages";
import { encodeBase64EncodedStringForUpload } from "../Utils/messages-media";

describe("security utility regressions", () => {
  it("extracts URL tokens without a backtracking URL regex", () => {
    expect(extractUrlFromText("open (https://example.com/path).")).toBe(
      "https://example.com/path"
    );
    expect(extractUrlFromText("contact user@example.com")).toBeUndefined();
  });

  it("removes long base64 padding in linear time", () => {
    expect(
      encodeBase64EncodedStringForUpload(`a+b/${"=".repeat(10_000)}`)
    ).toBe("a-b_");
  });

  it("normalizes Axios headers before passing them to HTTP clients", () => {
    expect(
      toPlainStringHeaders({
        Authorization: "Bearer token",
        "X-Retry": 2,
        "X-Enabled": true,
        Accept: ["application/json", "text/plain"],
        common: { Accept: "application/json" },
        empty: undefined
      } as any)
    ).toEqual({
      Authorization: "Bearer token",
      "X-Retry": "2",
      "X-Enabled": "true",
      Accept: "application/json, text/plain"
    });
  });
});
