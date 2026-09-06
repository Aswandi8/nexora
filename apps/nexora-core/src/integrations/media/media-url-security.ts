import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import type {
  SafeRemoteMediaAddress,
  SafeRemoteMediaTarget,
} from "./media-inspector.types";

const MAX_MEDIA_URL_LENGTH = 2_048;

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return true;
  }

  const [a, b] = parts;

  if (a === undefined || b === undefined) {
    return true;
  }

  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;

  if (a === 169 && b === 254) {
    return true;
  }

  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }

  if (a === 192 && b === 168) {
    return true;
  }

  if (a === 100 && b >= 64 && b <= 127) {
    return true;
  }

  if (a === 198 && (b === 18 || b === 19)) {
    return true;
  }

  if (a >= 224) {
    return true;
  }

  return false;
}

function mappedIpv6ToIpv4(address: string): string | null {
  const normalized = address.toLowerCase();

  if (!normalized.startsWith("::ffff:")) {
    return null;
  }

  const value = normalized.slice("::ffff:".length);

  if (isIP(value) === 4) {
    return value;
  }

  const parts = value.split(":");

  if (parts.length !== 2) {
    return null;
  }

  const high = Number.parseInt(parts[0] ?? "", 16);
  const low = Number.parseInt(parts[1] ?? "", 16);

  if (
    !Number.isInteger(high) ||
    !Number.isInteger(low) ||
    high < 0 ||
    high > 0xffff ||
    low < 0 ||
    low > 0xffff
  ) {
    return null;
  }

  const value32 = high * 0x10000 + low;

  return [
    (value32 >>> 24) & 0xff,
    (value32 >>> 16) & 0xff,
    (value32 >>> 8) & 0xff,
    value32 & 0xff,
  ].join(".");
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();

  if (normalized === "::") {
    return true;
  }

  if (normalized === "::1") {
    return true;
  }

  const mappedIpv4 = mappedIpv6ToIpv4(normalized);

  if (mappedIpv4) {
    return isPrivateIpv4(mappedIpv4);
  }

  /*
   * Unique local addresses:
   * fc00::/7
   */
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true;
  }

  /*
   * Link local:
   * fe80::/10
   */
  if (
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return true;
  }

  /*
   * Deprecated site-local:
   * fec0::/10
   */
  if (
    normalized.startsWith("fec") ||
    normalized.startsWith("fed") ||
    normalized.startsWith("fee") ||
    normalized.startsWith("fef")
  ) {
    return true;
  }

  /*
   * Multicast:
   * ff00::/8
   */
  if (normalized.startsWith("ff")) {
    return true;
  }

  return false;
}

function isPrivateIp(address: string): boolean {
  const version = isIP(address);

  if (version === 4) {
    return isPrivateIpv4(address);
  }

  if (version === 6) {
    return isPrivateIpv6(address);
  }

  return true;
}

function normalizeHostname(url: URL): string {
  return url.hostname.replace(/^\[/, "").replace(/\]$/, "").toLowerCase();
}

function assertMediaUrlLength(input: string): void {
  if (input.length > MAX_MEDIA_URL_LENGTH) {
    throw new Error("MEDIA_URL_INVALID");
  }
}

function assertAllowedPort(url: URL): void {
  if (!url.port) {
    return;
  }

  const port = Number(url.port);

  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error("MEDIA_URL_INVALID");
  }
}

function createLiteralIpTarget(
  url: URL,
  hostname: string,
): SafeRemoteMediaTarget {
  const family = isIP(hostname);

  if (family !== 4 && family !== 6) {
    throw new Error("MEDIA_URL_HOST_NOT_RESOLVED");
  }

  if (isPrivateIp(hostname)) {
    throw new Error("MEDIA_URL_PRIVATE_IP_NOT_ALLOWED");
  }

  return {
    url,
    address: {
      address: hostname,
      family,
    },
  };
}

async function resolveSafeAddress(
  hostname: string,
): Promise<SafeRemoteMediaAddress> {
  let addresses;

  try {
    addresses = await lookup(hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw new Error("MEDIA_URL_HOST_NOT_RESOLVED");
  }

  if (addresses.length === 0) {
    throw new Error("MEDIA_URL_HOST_NOT_RESOLVED");
  }

  /*
   * Conservative SSRF policy:
   *
   * Jika SATU DNS answer saja menunjuk ke private,
   * local, reserved, atau non-routable address,
   * hostname tersebut ditolak seluruhnya.
   *
   * Ini juga mengurangi risiko DNS rebinding.
   */
  for (const resolved of addresses) {
    if (isPrivateIp(resolved.address)) {
      throw new Error("MEDIA_URL_PRIVATE_IP_NOT_ALLOWED");
    }
  }

  const selected = addresses[0];

  if (!selected) {
    throw new Error("MEDIA_URL_HOST_NOT_RESOLVED");
  }

  if (selected.family !== 4 && selected.family !== 6) {
    throw new Error("MEDIA_URL_HOST_NOT_RESOLVED");
  }

  return {
    address: selected.address,
    family: selected.family,
  };
}

export async function assertSafeRemoteMediaUrl(
  input: string,
): Promise<SafeRemoteMediaTarget> {
  const normalizedInput = input.trim();

  assertMediaUrlLength(normalizedInput);

  let url: URL;

  try {
    url = new URL(normalizedInput);
  } catch {
    throw new Error("MEDIA_URL_INVALID");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("MEDIA_URL_PROTOCOL_NOT_ALLOWED");
  }

  if (url.username || url.password) {
    throw new Error("MEDIA_URL_CREDENTIALS_NOT_ALLOWED");
  }

  assertAllowedPort(url);

  const hostname = normalizeHostname(url);

  if (!hostname) {
    throw new Error("MEDIA_URL_HOST_NOT_RESOLVED");
  }

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("MEDIA_URL_PRIVATE_HOST_NOT_ALLOWED");
  }

  if (isIP(hostname)) {
    return createLiteralIpTarget(url, hostname);
  }

  const address = await resolveSafeAddress(hostname);

  return {
    url,
    address,
  };
}
