import dns from "dns/promises";
import ipaddr from "ipaddr.js";

// Blocked CIDR ranges for IPv4
const BLOCKED_IPV4_CIDRS: [ipaddr.IPv4, number][] = [
  [ipaddr.IPv4.parse("0.0.0.0"), 8],       // Current network (RFC 1122)
  [ipaddr.IPv4.parse("10.0.0.0"), 8],      // RFC 1918 Private
  [ipaddr.IPv4.parse("100.64.0.0"), 10],   // Carrier-grade NAT (RFC 6598)
  [ipaddr.IPv4.parse("127.0.0.0"), 8],     // Loopback (RFC 1122)
  [ipaddr.IPv4.parse("169.254.0.0"), 16],  // Link-Local / Cloud Metadata (RFC 3927)
  [ipaddr.IPv4.parse("172.16.0.0"), 12],   // RFC 1918 Private
  [ipaddr.IPv4.parse("192.168.0.0"), 16],  // RFC 1918 Private
  [ipaddr.IPv4.parse("198.18.0.0"), 15],   // Benchmarking tests (RFC 2544)
  [ipaddr.IPv4.parse("224.0.0.0"), 4],     // Multicast (RFC 5771)
  [ipaddr.IPv4.parse("240.0.0.0"), 4],     // Reserved for future use (RFC 1112)
];

// Blocked CIDR ranges for IPv6
const BLOCKED_IPV6_CIDRS: [ipaddr.IPv6, number][] = [
  [ipaddr.IPv6.parse("::"), 128],          // Unspecified
  [ipaddr.IPv6.parse("::1"), 128],         // Loopback
  [ipaddr.IPv6.parse("fc00::"), 7],        // Unique local address (ULA)
  [ipaddr.IPv6.parse("fe80::"), 10],       // Link-local unicast
  [ipaddr.IPv6.parse("ff00::"), 8],        // Multicast
];

/**
 * Checks whether an IP string is private, loopback, link-local, or cloud-metadata.
 */
export function isPrivateOrBlockedIp(ipString: string): boolean {
  try {
    let addr = ipaddr.parse(ipString);

    // If IPv4-mapped IPv6 address (e.g. ::ffff:192.168.1.1), unmap to IPv4
    if (addr.kind() === "ipv6" && (addr as ipaddr.IPv6).isIPv4MappedAddress()) {
      addr = (addr as ipaddr.IPv6).toIPv4Address();
    }

    if (addr.kind() === "ipv4") {
      const ipv4 = addr as ipaddr.IPv4;
      for (const [range, prefix] of BLOCKED_IPV4_CIDRS) {
        if (ipv4.match(range, prefix)) {
          return true;
        }
      }
      return false;
    }

    if (addr.kind() === "ipv6") {
      const ipv6 = addr as ipaddr.IPv6;
      for (const [range, prefix] of BLOCKED_IPV6_CIDRS) {
        if (ipv6.match(range, prefix)) {
          return true;
        }
      }
      return false;
    }

    return true;
  } catch {
    // If it cannot be parsed as valid IP, treat as potentially unsafe
    return true;
  }
}

export interface UrlSecurityResult {
  isSafe: boolean;
  error?: string;
  resolvedIps: string[];
  pinnedIp?: string;
}

/**
 * Validates target URL against SSRF attack vectors.
 * Resolves DNS and checks each resolved IP against blocked IP ranges.
 */
export async function validateTargetUrl(rawUrl: string): Promise<UrlSecurityResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return {
      isSafe: false,
      error: "MALFORMED_URL: URL format is invalid",
      resolvedIps: [],
    };
  }

  // Enforce HTTP / HTTPS protocol
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return {
      isSafe: false,
      error: `DISALLOWED_PROTOCOL: Only http and https protocols are supported (received: ${parsedUrl.protocol})`,
      resolvedIps: [],
    };
  }

  const hostname = parsedUrl.hostname;

  // Direct IP address in hostname
  if (ipaddr.isValid(hostname)) {
    if (isPrivateOrBlockedIp(hostname)) {
      return {
        isSafe: false,
        error: `SSRF_BLOCKED: Hostname points directly to blocked IP address ${hostname}`,
        resolvedIps: [hostname],
      };
    }
    return {
      isSafe: true,
      resolvedIps: [hostname],
      pinnedIp: hostname,
    };
  }

  // Hostname string checks (e.g. localhost, local, internal)
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return {
      isSafe: false,
      error: `SSRF_BLOCKED: Hostname "${hostname}" is restricted to local/internal domains`,
      resolvedIps: [],
    };
  }

  // DNS Resolution to detect rebinding & internal routing
  try {
    const lookupResults = await dns.lookup(hostname, { all: true });
    if (!lookupResults || lookupResults.length === 0) {
      return {
        isSafe: false,
        error: `DNS_LOOKUP_FAILED: No IP address resolved for hostname "${hostname}"`,
        resolvedIps: [],
      };
    }

    const resolvedIps = lookupResults.map((r) => r.address);

    for (const ip of resolvedIps) {
      if (isPrivateOrBlockedIp(ip)) {
        return {
          isSafe: false,
          error: `SSRF_BLOCKED: Hostname "${hostname}" resolves to private/blocked IP ${ip}`,
          resolvedIps,
        };
      }
    }

    return {
      isSafe: true,
      resolvedIps,
      pinnedIp: resolvedIps[0],
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      isSafe: false,
      error: `DNS_RESOLUTION_ERROR: Failed to resolve hostname: ${errMsg}`,
      resolvedIps: [],
    };
  }
}
