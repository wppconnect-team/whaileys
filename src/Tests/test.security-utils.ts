import sharp from "sharp";
import { toPlainStringHeaders } from "../Utils/generics";
import { extractUrlFromText } from "../Utils/messages";
import {
  encodeBase64EncodedStringForUpload,
  extractImageThumb,
  generateProfilePicture
} from "../Utils/messages-media";

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

  it("processes thumbnails and profile pictures with the patched Sharp path", async () => {
    const source = await sharp({
      create: {
        width: 64,
        height: 32,
        channels: 3,
        background: "#336699"
      }
    })
      .png()
      .toBuffer();

    const thumbnail = await extractImageThumb(source, 16);
    expect(thumbnail.original).toEqual({ width: 64, height: 32 });
    expect((await sharp(thumbnail.buffer).metadata()).width).toBe(16);

    const profile = await generateProfilePicture(source);
    expect(await sharp(profile.img).metadata()).toMatchObject({
      width: 640,
      height: 640,
      format: "jpeg"
    });
  });
});
