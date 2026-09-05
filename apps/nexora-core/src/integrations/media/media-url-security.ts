import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import type {
  SafeRemoteMediaAddress,
  SafeRemoteMediaTarget,
} from "./media-inspector.types";

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return true;
  }

  const [a, b] = parts;

  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;

  return false;
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();

  if (normalized === "::") return true;
  if (normalized === "::1") return true;

  if (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return true;
  }

  if (normalized.startsWith("::ffff:")) {
    const ipv4 = normalized.slice("::ffff:".length);

    if (isIP(ipv4) === 4) {
      return isPrivateIpv4(ipv4);
    }
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
  const addresses = await lookup(hostname, {
    all: true,
    verbatim: true,
  });

  if (addresses.length === 0) {
    throw new Error("MEDIA_URL_HOST_NOT_RESOLVED");
  }

  /*
   * Conservative policy:
   * jika SATU saja DNS answer menunjuk ke private/reserved IP,
   * seluruh hostname ditolak.
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
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new Error("MEDIA_URL_INVALID");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("MEDIA_URL_PROTOCOL_NOT_ALLOWED");
  }

  if (url.username || url.password) {
    throw new Error("MEDIA_URL_CREDENTIALS_NOT_ALLOWED");
  }

  const hostname = normalizeHostname(url);

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
