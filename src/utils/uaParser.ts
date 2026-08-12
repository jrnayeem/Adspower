import { ParsedUA, DeviceSpec } from '../types';
import { getAllDevices } from '../data/deviceDatabase';

/**
 * Extracts exact device model identifier and brand from User-Agent string.
 * Examples: SM-G993B, XT2282G, 23116PN5BC, Pixel 9, iPhone14,7
 */
function extractAndroidModelIdentifier(ua: string): { model: string; brand: string } {
  const parenMatch = ua.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const parts = parenMatch[1].split(';').map((s) => s.trim());
    const androidIndex = parts.findIndex((p) => /Android/i.test(p));

    if (androidIndex !== -1) {
      const candidates = parts.slice(androidIndex + 1);
      for (const cand of candidates) {
        // Ignore generic or platform tokens
        if (/^(wv|Mobile|Tablet|K|Linux|arm64|x86_64|x86|en-US|ru-RU|zh-CN)$/i.test(cand)) {
          continue;
        }

        let rawModel = cand;
        if (/Build\//i.test(rawModel)) {
          rawModel = rawModel.split(/Build\//i)[0].trim();
        }

        if (rawModel && rawModel.length >= 2 && !/^Android/i.test(rawModel)) {
          let brand = 'Unknown';
          if (/SM-|Galaxy|S24|S23|S22|S21|A55|A54/i.test(rawModel)) brand = 'Samsung';
          else if (/Pixel/i.test(rawModel)) brand = 'Google';
          else if (/Xiaomi|Redmi|POCO|23\d|24\d/i.test(rawModel)) brand = 'Xiaomi';
          else if (/Moto|XT\d/i.test(rawModel)) brand = 'Motorola';
          else if (/Vivo|V23|V24/i.test(rawModel)) brand = 'Vivo';
          else if (/Oppo|CPH/i.test(rawModel)) brand = 'Oppo';
          else if (/OnePlus/i.test(rawModel)) brand = 'OnePlus';
          else if (/Realme|RMX/i.test(rawModel)) brand = 'Realme';

          return { model: rawModel, brand };
        }
      }
    }
  }

  // Direct Pixel pattern match
  const pixelMatch = ua.match(/\b(Pixel\s+\d+\w*)\b/i);
  if (pixelMatch) {
    return { model: pixelMatch[1], brand: 'Google' };
  }

  return { model: 'Unknown Device', brand: 'Unknown' };
}

function extractIosModelIdentifier(ua: string): { model: string; brand: string } {
  // Check FBDV tag e.g. FBDV/iPhone14,7 or [FBDV/iPad14,6]
  const fbdvMatch = ua.match(/FBDV\/([a-zA-Z0-9,-]+)/i);
  if (fbdvMatch) {
    return { model: fbdvMatch[1], brand: 'Apple' };
  }
  const match = ua.match(/\b(iPhone\d+,\d+|iPad\d+,\d+)\b/i);
  if (match) {
    return { model: match[1], brand: 'Apple' };
  }
  if (/iPad/i.test(ua)) {
    return { model: 'iPad', brand: 'Apple' };
  }
  if (/iPhone/i.test(ua)) {
    return { model: 'iPhone', brand: 'Apple' };
  }
  return { model: 'Unknown Device', brand: 'Apple' };
}

export function parseUserAgent(uaString: string): ParsedUA {
  const ua = uaString.trim();
  if (!ua) {
    return {
      rawUA: '',
      brand: 'Unknown',
      model: 'Unknown Device',
      osName: 'Unknown',
      osVersion: '',
      browserName: 'Unknown',
      browserVersion: '',
      isWebView: false,
      deviceType: 'mobile',
      platform: 'other',
      language: 'en-US',
      isUnknownDevice: true,
      isValidUA: false,
    };
  }

  let osName: ParsedUA['osName'] = 'Unknown';
  let osVersion = '';
  let platform: ParsedUA['platform'] = 'other';
  let deviceType: ParsedUA['deviceType'] = 'mobile';

  // 1. Detect OS & Platform
  if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && 'ontouchend' in globalThis)) {
    osName = 'iPadOS';
    platform = 'ipad';
    deviceType = 'tablet';
    const match = ua.match(/OS (\d+[._]\d+(?:[._]\d+)?)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/iPhone|iPod/i.test(ua)) {
    osName = 'iOS';
    platform = 'ios';
    deviceType = 'mobile';
    const match = ua.match(/OS (\d+[._]\d+(?:[._]\d+)?)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/Android/i.test(ua)) {
    osName = 'Android';
    platform = 'android';
    const match = ua.match(/Android\s+([\d.]+)/i);
    if (match) osVersion = match[1];

    if (/Tablet|Tab/i.test(ua) && !/Mobile/i.test(ua)) {
      deviceType = 'tablet';
    } else {
      deviceType = 'mobile';
    }
  } else if (/Windows/i.test(ua)) {
    osName = 'Windows';
    platform = 'other';
    deviceType = 'desktop';
  } else if (/Macintosh/i.test(ua)) {
    osName = 'macOS';
    platform = 'other';
    deviceType = 'desktop';
  }

  // 2. Detect Browser & Versions
  let browserName = 'Chrome';
  let browserVersion = '';
  let chromeVersion: string | undefined = undefined;
  let facebookAppVersion: string | undefined = undefined;
  let isWebView = false;

  const chromeMatch = ua.match(/Chrome\/([\d.]+)/i);
  if (chromeMatch) chromeVersion = chromeMatch[1];

  const fbMatch = ua.match(/FBAV\/([\d.]+)/i);
  if (fbMatch) facebookAppVersion = fbMatch[1];

  if (/;\s*wv\b/i.test(ua) || /Version\/[\d.]+\s+Chrome/i.test(ua) || /FB_IAB/i.test(ua) || /Instagram/i.test(ua)) {
    isWebView = true;
  }

  if (/FBAV|FBAN|FB_IAB/i.test(ua)) {
    browserName = 'Facebook App';
    browserVersion = facebookAppVersion || chromeVersion || '';
  } else if (/Instagram/i.test(ua)) {
    browserName = 'Instagram';
    const instaMatch = ua.match(/Instagram\s+([\d.]+)/i);
    if (instaMatch) browserVersion = instaMatch[1];
  } else if (/SamsungBrowser\/([\d.]+)/i.test(ua)) {
    browserName = 'Samsung Internet';
    const sbMatch = ua.match(/SamsungBrowser\/([\d.]+)/i);
    if (sbMatch) browserVersion = sbMatch[1];
  } else if (/EdgA?\/([\d.]+)/i.test(ua)) {
    browserName = 'Edge';
    const edgeMatch = ua.match(/EdgA?\/([\d.]+)/i);
    if (edgeMatch) browserVersion = edgeMatch[1];
  } else if (/OPR\/([\d.]+)|OPT\/([\d.]+)/i.test(ua)) {
    browserName = 'Opera';
    const opMatch = ua.match(/(?:OPR|OPT)\/([\d.]+)/i);
    if (opMatch) browserVersion = opMatch[1];
  } else if (/Firefox\/([\d.]+)|FxiOS\/([\d.]+)/i.test(ua)) {
    browserName = 'Firefox';
    const ffMatch = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/i);
    if (ffMatch) browserVersion = ffMatch[1];
  } else if (chromeMatch) {
    browserName = 'Chrome';
    browserVersion = chromeVersion || '';
  } else if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browserName = 'Safari';
    const safariMatch = ua.match(/Version\/([\d.]+)/i);
    if (safariMatch) browserVersion = safariMatch[1];
  }

  // 3. Detect Language
  let language = 'en-US';
  const langMatch = ua.match(/;\s*([a-z]{2}-[a-z]{2}|[a-z]{2})\b/i);
  if (langMatch) language = langMatch[1];

  // 4. Extract Exact Model Identifier
  let extracted = { model: 'Unknown Device', brand: 'Unknown' };
  if (platform === 'android') {
    extracted = extractAndroidModelIdentifier(ua);
  } else if (platform === 'ios' || platform === 'ipad') {
    extracted = extractIosModelIdentifier(ua);
  }

  // 5. Match against Local Device Database
  const devices = getAllDevices();
  let matchedDevice: DeviceSpec | undefined = undefined;

  for (const device of devices) {
    // Exact match against extracted model code
    const isModelCodeMatch =
      extracted.model !== 'Unknown Device' &&
      (device.model.toLowerCase() === extracted.model.toLowerCase() ||
        device.modelPatterns.some((p) => p.toLowerCase() === extracted.model.toLowerCase()));

    if (isModelCodeMatch) {
      matchedDevice = device;
      break;
    }

    // Pattern match inside raw UA string
    for (const pattern of device.modelPatterns) {
      if (pattern.length >= 3) {
        const regex = new RegExp(`\\b${escapeRegExp(pattern)}\\b`, 'i');
        if (regex.test(ua)) {
          matchedDevice = device;
          break;
        }
      }
    }
    if (matchedDevice) break;
  }

  const brand = matchedDevice ? matchedDevice.brand : extracted.brand;
  const model = matchedDevice ? matchedDevice.model : extracted.model;
  const isUnknownDevice = !matchedDevice;
  const isValidUA = ua.length > 20 && (osName !== 'Unknown' || chromeVersion !== undefined || /Mozilla/i.test(ua));

  return {
    rawUA: ua,
    brand,
    model,
    osName,
    osVersion,
    browserName,
    browserVersion,
    chromeVersion,
    facebookAppVersion,
    isWebView,
    deviceType,
    platform,
    language,
    matchedDevice,
    isUnknownDevice,
    isValidUA,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Gets specs for a parsed UA.
 * STRICT RESOLUTION RULE:
 * If the exact model is matched in local DB, use exact DB specifications.
 * If not matched, leave resolution empty ("") until Hardware Lookup completes!
 * Do not guess resolutions or marketing names.
 */
export function getDeviceSpecsForParsedUA(parsed: ParsedUA): DeviceSpec {
  if (parsed.matchedDevice) {
    return parsed.matchedDevice;
  }

  return {
    brand: parsed.brand !== 'Unknown' ? parsed.brand : 'Unknown',
    model: parsed.model !== 'Unknown' ? parsed.model : 'Unknown Device',
    modelPatterns: [],
    nativeResolution: '', // Left empty until Hardware Lookup completes
    viewport: '',
    screenWidth: 0,
    screenHeight: 0,
    dpr: 1,
    touchPoints: 5,
    ram: '',
    cpuCores: 0,
    deviceType: parsed.deviceType === 'desktop' ? 'mobile' : parsed.deviceType,
    platform: parsed.platform === 'other' ? 'android' : parsed.platform,
  };
}
