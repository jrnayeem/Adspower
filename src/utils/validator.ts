import { ParsedUA, ProxyItem, ValidationWarning } from '../types';

export function validateInputData(
  parsedUAs: ParsedUA[],
  proxies: ProxyItem[],
  targetCount: number
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // 1. User Agent Count & Missing Check
  if (parsedUAs.length === 0) {
    warnings.push({
      type: 'danger',
      code: 'NO_UA',
      message: 'No User-Agents provided! Please paste at least one User-Agent string to generate profiles.',
    });
    return warnings;
  }

  // 2. Invalid User Agents Check
  const invalidUAs = parsedUAs.filter((u) => !u.isValidUA);
  if (invalidUAs.length > 0) {
    warnings.push({
      type: 'danger',
      code: 'INVALID_UA',
      message: `Found ${invalidUAs.length} invalid or corrupted User-Agent string(s).`,
      count: invalidUAs.length,
      details: invalidUAs.map((u) => u.rawUA.substring(0, 60) + '...'),
    });
  }

  // 3. Duplicate User Agents Check
  const uaMap = new Map<string, number>();
  parsedUAs.forEach((u) => {
    uaMap.set(u.rawUA, (uaMap.get(u.rawUA) || 0) + 1);
  });
  const duplicateEntries = Array.from(uaMap.entries()).filter(([, count]) => count > 1);
  if (duplicateEntries.length > 0) {
    warnings.push({
      type: 'warning',
      code: 'DUPLICATE_UA',
      message: `Detected ${duplicateEntries.length} duplicate User-Agent string(s) in input.`,
      count: duplicateEntries.length,
    });
  }

  // 4. Unknown Devices Check
  const unknownDevices = parsedUAs.filter((u) => u.isUnknownDevice && u.isValidUA);
  if (unknownDevices.length > 0) {
    warnings.push({
      type: 'warning',
      code: 'UNKNOWN_DEVICE',
      message: `${unknownDevices.length} User-Agent(s) contain unrecognised device models. Hardware specifications will be estimated or looked up via AI.`,
      count: unknownDevices.length,
    });
  }

  // 5. Proxy Count & Mismatch Check
  if (proxies.length === 0) {
    warnings.push({
      type: 'info',
      code: 'NO_PROXY',
      message: 'No proxies provided. Profiles will be generated with "noproxy" mode.',
    });
  } else {
    const invalidProxies = proxies.filter((p) => !p.isValid && p.protocol !== 'noproxy');
    if (invalidProxies.length > 0) {
      warnings.push({
        type: 'danger',
        code: 'INVALID_PROXY',
        message: `Found ${invalidProxies.length} invalid proxy line(s). Please verify host:port or user:pass formatting.`,
        count: invalidProxies.length,
        details: invalidProxies.map((p) => p.raw),
      });
    }

    if (proxies.length < targetCount && targetCount > 1) {
      warnings.push({
        type: 'info',
        code: 'PROXY_CYCLING',
        message: `Target batch size (${targetCount}) exceeds proxy count (${proxies.length}). Proxies will be cycled sequentially.`,
      });
    }
  }

  // 6. UA Cycling Notice
  if (parsedUAs.length < targetCount && targetCount > 1) {
    warnings.push({
      type: 'info',
      code: 'UA_CYCLING',
      message: `Target batch size (${targetCount}) exceeds User-Agent count (${parsedUAs.length}). User-Agents will be cycled sequentially.`,
    });
  }

  return warnings;
}
