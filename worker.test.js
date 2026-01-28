import { describe, test } from "node:test";
import assert from "node:assert";
import {
  pick,
  getUtcOffset,
  formatResponse,
  formatLocationResponse,
  formatTimeResponse,
  formatRootPage,
} from "./worker.js";

describe("pick function", () => {
  test("should return an element from the array", () => {
    const arr = ["a", "b", "c"];
    const result = pick(arr);
    assert.ok(arr.includes(result));
  });

  test("should work with single element array", () => {
    const arr = ["only"];
    const result = pick(arr);
    assert.strictEqual(result, "only");
  });
});

describe("getUtcOffset function", () => {
  test("should return UTC offset for valid timezone", () => {
    const result = getUtcOffset("Australia/Melbourne");
    assert.match(result, /^UTC[+-]\d{2}:\d{2}$/);
  });

  test("should handle UTC timezone", () => {
    const result = getUtcOffset("UTC");
    // UTC timezone may return just "UTC" or "UTC+00:00" depending on implementation.
    assert.ok(result === "UTC" || result.match(/^UTC[+-]\d{2}:\d{2}$/));
  });

  test("should return fallback for invalid timezone", () => {
    const result = getUtcOffset("Invalid/Timezone");
    assert.strictEqual(result, "UTC+??:??");
  });

  test("should return fallback for missing timezone", () => {
    const result = getUtcOffset(null);
    assert.strictEqual(result, "UTC+??:??");
  });

  test("should return fallback for undefined timezone", () => {
    const result = getUtcOffset(undefined);
    assert.strictEqual(result, "UTC+??:??");
  });
});

describe("formatResponse function", () => {
  test("should include intro text", () => {
    const result = formatResponse("your location is", "test body");
    assert.match(result, /your location is/);
  });

  test("should include body text", () => {
    const result = formatResponse("intro", "test body content");
    assert.match(result, /test body content/);
  });

  test("should include a qualifier", () => {
    const result = formatResponse("intro", "body");
    // Check for any of the possible qualifiers.
    const hasQualifier =
      /roughly|mostly|probably|kinda|sorta|seemingly|vaguely|supposedly/.test(
        result,
      );
    assert.ok(hasQualifier);
  });

  test("should include an animal emoji", () => {
    const result = formatResponse("intro", "body");
    // Check that result contains at least one emoji character.
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(result);
    assert.ok(hasEmoji);
  });
});

describe("formatLocationResponse function", () => {
  test("should format valid location data", () => {
    const mockRequest = {
      cf: {
        country: "AU",
        region: "Victoria",
        city: "Melbourne",
        latitude: "-37.8136",
        longitude: "144.9631",
        postalCode: "3000",
        colo: "MEL",
      },
    };
    const result = formatLocationResponse(mockRequest);
    assert.match(result, /AU/);
    assert.match(result, /Victoria/);
    assert.match(result, /Melbourne/);
    assert.match(result, /MEL/);
  });

  test("should handle missing cf data", () => {
    const mockRequest = {};
    const result = formatLocationResponse(mockRequest);
    assert.strictEqual(result, "Unable to retrieve location data");
  });

  test("should handle partial cf data", () => {
    const mockRequest = {
      cf: {
        country: "AU",
        // Missing other fields.
      },
    };
    const result = formatLocationResponse(mockRequest);
    assert.match(result, /AU/);
    assert.match(result, /unknown/);
  });

  test("should handle all missing fields in cf object", () => {
    const mockRequest = {
      cf: {},
    };
    const result = formatLocationResponse(mockRequest);
    const unknownCount = (result.match(/unknown/g) || []).length;
    assert.ok(unknownCount >= 6); // Should have multiple "unknown" values.
  });
});

describe("formatTimeResponse function", () => {
  test("should format valid timezone data", () => {
    const mockRequest = {
      cf: {
        timezone: "Australia/Melbourne",
        colo: "MEL",
      },
    };
    const result = formatTimeResponse(mockRequest);
    assert.match(result, /Australia\/Melbourne/);
    assert.match(result, /MEL/);
    assert.match(result, /UTC[+-]\d{2}:\d{2}/);
  });

  test("should handle missing cf data", () => {
    const mockRequest = {};
    const result = formatTimeResponse(mockRequest);
    assert.strictEqual(result, "Unable to retrieve timezone data");
  });

  test("should handle missing timezone", () => {
    const mockRequest = {
      cf: {
        colo: "MEL",
      },
    };
    const result = formatTimeResponse(mockRequest);
    assert.match(result, /unknown/);
    assert.match(result, /UTC\+\?\?:\?\?/);
  });

  test("should handle invalid timezone gracefully", () => {
    const mockRequest = {
      cf: {
        timezone: "Invalid/Timezone",
        colo: "XXX",
      },
    };
    const result = formatTimeResponse(mockRequest);
    assert.match(result, /Invalid\/Timezone/);
    assert.match(result, /unknown/); // Local time should be unknown.
  });
});

describe("formatRootPage function", () => {
  test("should return HTML content", () => {
    const result = formatRootPage();
    assert.match(result, /<!DOCTYPE html>/);
    assert.match(result, /<html>/);
  });

  test("should include title", () => {
    const result = formatRootPage();
    assert.match(result, /<title>Vaguely<\/title>/);
  });

  test("should include route information", () => {
    const result = formatRootPage();
    assert.match(result, /\/where/);
    assert.match(result, /\/when/);
  });

  test("should include an animal emoji", () => {
    const result = formatRootPage();
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(result);
    assert.ok(hasEmoji);
  });
});
