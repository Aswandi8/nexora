import assert from "node:assert/strict";
import test from "node:test";

import { assertSafeRemoteMediaUrl } from "@/integrations/media/media-url-security";

async function assertRejected(
  url: string,
  expectedError: string,
): Promise<void> {
  await assert.rejects(
    () => assertSafeRemoteMediaUrl(url),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, expectedError);

      return true;
    },
  );
}

test("blocks IPv4 loopback addresses", async () => {
  await assertRejected(
    "http://127.0.0.1/video.mp4",
    "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED",
  );

  await assertRejected(
    "http://127.255.255.254/video.mp4",
    "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED",
  );
});

test("blocks RFC1918 private IPv4 networks", async () => {
  const privateUrls = [
    "http://10.0.0.1/video.mp4",
    "http://172.16.0.1/video.mp4",
    "http://172.31.255.254/video.mp4",
    "http://192.168.1.1/video.mp4",
  ];

  for (const url of privateUrls) {
    await assertRejected(url, "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED");
  }
});

test("blocks IPv4 link-local and carrier-grade NAT networks", async () => {
  const blockedUrls = [
    "http://169.254.169.254/latest/meta-data/",
    "http://100.64.0.1/video.mp4",
    "http://100.127.255.254/video.mp4",
    "http://198.18.0.1/video.mp4",
  ];

  for (const url of blockedUrls) {
    await assertRejected(url, "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED");
  }
});

test("blocks IPv6 loopback", async () => {
  await assertRejected(
    "http://[::1]/video.mp4",
    "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED",
  );
});

test("blocks IPv6 unique-local addresses", async () => {
  const blockedUrls = [
    "http://[fc00::1]/video.mp4",
    "http://[fd12:3456:789a::1]/video.mp4",
  ];

  for (const url of blockedUrls) {
    await assertRejected(url, "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED");
  }
});

test("blocks IPv6 link-local addresses", async () => {
  await assertRejected(
    "http://[fe80::1]/video.mp4",
    "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED",
  );
});

test("blocks IPv6 multicast addresses", async () => {
  await assertRejected(
    "http://[ff02::1]/video.mp4",
    "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED",
  );
});

test("blocks IPv4-mapped IPv6 loopback address", async () => {
  await assertRejected(
    "http://[::ffff:127.0.0.1]/video.mp4",
    "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED",
  );
});

test("blocks hexadecimal IPv4-mapped IPv6 loopback address", async () => {
  await assertRejected(
    "http://[::ffff:7f00:1]/video.mp4",
    "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED",
  );
});

test("blocks IPv4-mapped IPv6 private network", async () => {
  await assertRejected(
    "http://[::ffff:c0a8:101]/video.mp4",
    "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED",
  );
});

test("blocks localhost hostname without DNS resolution", async () => {
  await assertRejected(
    "http://localhost/video.mp4",
    "MEDIA_URL_PRIVATE_HOST_NOT_ALLOWED",
  );

  await assertRejected(
    "http://media.localhost/video.mp4",
    "MEDIA_URL_PRIVATE_HOST_NOT_ALLOWED",
  );

  await assertRejected(
    "http://internal.local/video.mp4",
    "MEDIA_URL_PRIVATE_HOST_NOT_ALLOWED",
  );
});

test("rejects URL credentials", async () => {
  await assertRejected(
    "https://username:password@example.com/video.mp4",
    "MEDIA_URL_CREDENTIALS_NOT_ALLOWED",
  );
});

test("rejects non-HTTP protocols", async () => {
  await assertRejected("file:///etc/passwd", "MEDIA_URL_PROTOCOL_NOT_ALLOWED");

  await assertRejected(
    "ftp://example.com/video.mp4",
    "MEDIA_URL_PROTOCOL_NOT_ALLOWED",
  );
});

test("rejects excessively long media URLs", async () => {
  const url = `https://example.com/${"a".repeat(2_100)}`;

  await assertRejected(url, "MEDIA_URL_INVALID");
});

test("accepts public IPv4 literal without DNS lookup", async () => {
  const target = await assertSafeRemoteMediaUrl("https://1.1.1.1/video.mp4");

  assert.equal(target.address.address, "1.1.1.1");
  assert.equal(target.address.family, 4);
  assert.equal(target.url.toString(), "https://1.1.1.1/video.mp4");
});

test("accepts public IPv6 literal without DNS lookup", async () => {
  const target = await assertSafeRemoteMediaUrl(
    "https://[2606:4700:4700::1111]/video.mp4",
  );

  assert.equal(target.address.address, "2606:4700:4700::1111");
  assert.equal(target.address.family, 6);
});
