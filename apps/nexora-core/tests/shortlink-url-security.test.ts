import assert from "node:assert/strict";
import test from "node:test";

import {
  createShortlinkSchema,
  httpUrlSchema,
  shortlinkSlugSchema,
} from "@nexora/contracts";

const validShortlinkInput = {
  slug: "video-demo",
  destinationUrl: "https://example.com/watch",
  title: "Video Demo",
  description: "Nexora test shortlink",
  mediaUrl: "https://cdn.example.com/video.mp4",
  displayDurationMs: 15_000,
  status: "ACTIVE" as const,
};

test("httpUrlSchema accepts HTTP and HTTPS URLs", () => {
  assert.equal(
    httpUrlSchema.safeParse("https://example.com/video.mp4").success,
    true,
  );

  assert.equal(
    httpUrlSchema.safeParse("http://example.com/video.mp4").success,
    true,
  );
});

test("httpUrlSchema rejects non-HTTP URL schemes", () => {
  const forbiddenUrls = [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "ftp://example.com/file.mp4",
    "mailto:admin@example.com",
  ];

  for (const url of forbiddenUrls) {
    const result = httpUrlSchema.safeParse(url);

    assert.equal(result.success, false, `${url} must be rejected`);
  }
});

test("createShortlinkSchema rejects unsafe destinationUrl schemes", () => {
  const result = createShortlinkSchema.safeParse({
    ...validShortlinkInput,
    destinationUrl: "javascript:alert(document.domain)",
  });

  assert.equal(result.success, false);
});

test("createShortlinkSchema rejects unsafe mediaUrl schemes", () => {
  const result = createShortlinkSchema.safeParse({
    ...validShortlinkInput,
    mediaUrl: "file:///tmp/video.mp4",
  });

  assert.equal(result.success, false);
});

test("createShortlinkSchema accepts valid HTTP resources", () => {
  const result = createShortlinkSchema.safeParse(validShortlinkInput);

  assert.equal(result.success, true);
});

test("shortlinkSlugSchema accepts canonical slugs", () => {
  const validSlugs = [
    "video",
    "video-demo",
    "video-demo-1",
    "nexora-2026",
    "abc123",
  ];

  for (const slug of validSlugs) {
    assert.equal(
      shortlinkSlugSchema.safeParse(slug).success,
      true,
      `${slug} should be valid`,
    );
  }
});

test("shortlinkSlugSchema rejects malformed public slugs", () => {
  const invalidSlugs = [
    "",
    "Video",
    "video_demo",
    "video--demo",
    "-video",
    "video-",
    "video/demo",
    "video.demo",
    "video demo",
    "a".repeat(101),
  ];

  for (const slug of invalidSlugs) {
    assert.equal(
      shortlinkSlugSchema.safeParse(slug).success,
      false,
      `${slug} should be invalid`,
    );
  }
});
