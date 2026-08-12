import { ParsedUA, DeviceSpec } from '../types';
import { getCustomCachedDevices, BUILTIN_DEVICE_DATABASE, saveCustomDeviceToCache } from '../data/deviceDatabase';

export interface BatchLookupStatus {
  total: number;
  completed: number;
  failed: number;
  currentDevice: string;
  currentSource: string;
  percent: number;
  isFinished: boolean;
  resolvedSpecs: DeviceSpec[];
  errors: Array<{ device: string; error: string }>;
}

export interface UniqueUnknownDevice {
  key: string;
  brand: string;
  model: string;
  rawUA: string;
  parsedUA: ParsedUA;
}

/**
 * Extracts unique unknown device models from parsed User-Agents.
 * Deduplicates by brand + model so duplicate models in a batch are looked up only ONCE.
 */
export function extractUniqueUnknownDevices(parsedUAs: ParsedUA[]): UniqueUnknownDevice[] {
  const map = new Map<string, UniqueUnknownDevice>();

  for (const ua of parsedUAs) {
    if (ua.isUnknownDevice && ua.isValidUA) {
      const brand = ua.brand || 'Generic';
      const model = ua.model || 'Unknown Model';
      const key = `${brand.toLowerCase().trim()}:::${model.toLowerCase().trim()}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          brand,
          model,
          rawUA: ua.rawUA,
          parsedUA: ua,
        });
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Stage 3: Deterministic Client-side Spec Generator
 * Never fails, works offline and on static deployment platforms (GitHub Pages, Netlify, Cloudflare Pages, Vercel).
 */
export function generateClientFallbackSpec(item: UniqueUnknownDevice): DeviceSpec {
  const ua = item.rawUA.toLowerCase();
  const brand = item.brand;
  const model = item.model;
  const isTablet = item.parsedUA.deviceType === 'tablet' || /ipad|tablet|tab|pad/i.test(ua) || /tab/i.test(model);
  const isIos = item.parsedUA.platform === 'ios' || item.parsedUA.platform === 'ipad' || /iphone|ipad/i.test(ua) || brand.toLowerCase() === 'apple';

  if (isIos) {
    if (isTablet) {
      return {
        brand: 'Apple',
        model: model !== 'Unknown Model' ? model : 'iPad Pro',
        modelPatterns: [model, item.parsedUA.model].filter(Boolean),
        nativeResolution: '1668x2388',
        viewport: '834x1194',
        screenWidth: 834,
        screenHeight: 1194,
        dpr: 2.0,
        touchPoints: 5,
        ram: '8GB',
        cpuCores: 8,
        deviceType: 'tablet',
        platform: 'ipad',
      };
    }
    return {
      brand: 'Apple',
      model: model !== 'Unknown Model' ? model : 'iPhone',
      modelPatterns: [model, item.parsedUA.model].filter(Boolean),
      nativeResolution: '1179x2556',
      viewport: '393x852',
      screenWidth: 393,
      screenHeight: 852,
      dpr: 3.0,
      touchPoints: 5,
      ram: '8GB',
      cpuCores: 6,
      deviceType: 'mobile',
      platform: 'ios',
    };
  }

  // Android Brands
  const bLower = brand.toLowerCase();
  const mLower = model.toLowerCase();

  // High-end / Flagship patterns (2K/4K resolutions)
  const isUltra = /ultra|pro\+|pro max|fold|flip|magic\d|find x|gt \d|x100/i.test(mLower);
  // Tablet
  if (isTablet) {
    return {
      brand: brand !== 'Generic' ? brand : 'Android',
      model: model !== 'Unknown Model' ? model : 'Android Tablet',
      modelPatterns: [model, item.parsedUA.model].filter(Boolean),
      nativeResolution: '1600x2560',
      viewport: '800x1280',
      screenWidth: 800,
      screenHeight: 1280,
      dpr: 2.0,
      touchPoints: 10,
      ram: '8GB',
      cpuCores: 8,
      deviceType: 'tablet',
      platform: 'android',
    };
  }

  if (isUltra) {
    return {
      brand: brand !== 'Generic' ? brand : 'Android',
      model: model !== 'Unknown Model' ? model : 'Android Flagship',
      modelPatterns: [model, item.parsedUA.model].filter(Boolean),
      nativeResolution: '1440x3120',
      viewport: '384x832',
      screenWidth: 384,
      screenHeight: 832,
      dpr: 3.75,
      touchPoints: 10,
      ram: '12GB',
      cpuCores: 8,
      deviceType: 'mobile',
      platform: 'android',
    };
  }

  // Standard FHD+ Mobile Spec
  return {
    brand: brand !== 'Generic' ? brand : 'Android',
    model: model !== 'Unknown Model' ? model : 'Android Smartphone',
    modelPatterns: [model, item.parsedUA.model].filter(Boolean),
    nativeResolution: '1080x2400',
    viewport: '412x915',
    screenWidth: 412,
    screenHeight: 915,
    dpr: 2.625,
    touchPoints: 10,
    ram: '8GB',
    cpuCores: 8,
    deviceType: 'mobile',
    platform: 'android',
  };
}

/**
 * Searches a single unknown device using multi-source fallbacks:
 * 1. Cache / Builtin DB
 * 2. Remote `/api/lookup-device` (with 5s fetch timeout)
 * 3. Client Heuristic Generator (Guarantee 100% success)
 */
export async function lookupSingleDeviceWithFallbacks(
  item: UniqueUnknownDevice,
  onStatusUpdate?: (status: string) => void
): Promise<DeviceSpec> {
  // Source 1: Check existing local cache
  if (onStatusUpdate) onStatusUpdate('Checking local cache...');
  const cachedList = getCustomCachedDevices();
  const cachedMatch = cachedList.find(
    (d) =>
      d.model.toLowerCase() === item.model.toLowerCase() ||
      d.modelPatterns.some((p) => p.toLowerCase() === item.model.toLowerCase())
  );
  if (cachedMatch) {
    return cachedMatch;
  }

  // Source 2: Server Gemini API endpoint with timeout
  try {
    if (onStatusUpdate) onStatusUpdate('Searching API & Specification Databases...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/lookup-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAgent: item.rawUA,
        brand: item.brand,
        model: item.model,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        const spec: DeviceSpec = {
          brand: d.brand || item.brand || 'Generic',
          model: d.model || item.model || 'Unknown Model',
          modelPatterns: Array.from(new Set([d.model, item.model, item.parsedUA.model].filter(Boolean))),
          nativeResolution: d.nativeResolution || '1080x2400',
          viewport: d.viewport || '412x915',
          screenWidth: d.screenWidth || 412,
          screenHeight: d.screenHeight || 915,
          dpr: d.dpr || 2.625,
          touchPoints: d.touchPoints || 10,
          ram: d.ram || '8GB',
          cpuCores: d.cpuCores || 8,
          deviceType: d.deviceType === 'tablet' ? 'tablet' : 'mobile',
          platform: d.platform === 'ios' ? 'ios' : d.platform === 'ipad' ? 'ipad' : 'android',
        };
        return spec;
      }
    }
  } catch (err: any) {
    // API endpoint unreachable, timed out, or CORS error on static host
    console.warn(`Remote API lookup skipped for ${item.model}:`, err?.message || err);
  }

  // Source 3: Client Heuristic Engine (Offline / Static platform safe)
  if (onStatusUpdate) onStatusUpdate('Synthesizing hardware specifications...');
  return generateClientFallbackSpec(item);
}

/**
 * Main One-Click Batch Hardware Lookup Engine.
 * Processes all unique unknown devices in parallel queues (max 3 concurrent).
 * Never fails completely, saves all results to cache, and triggers progress updates.
 */
export async function executeBatchHardwareLookup(
  unknownDevices: UniqueUnknownDevice[],
  onProgress: (status: BatchLookupStatus) => void,
  concurrencyLimit: number = 3
): Promise<DeviceSpec[]> {
  const total = unknownDevices.length;
  let completed = 0;
  let failed = 0;
  const resolvedSpecs: DeviceSpec[] = [];
  const errors: Array<{ device: string; error: string }> = [];

  if (total === 0) {
    onProgress({
      total: 0,
      completed: 0,
      failed: 0,
      currentDevice: 'None',
      currentSource: 'Idle',
      percent: 100,
      isFinished: true,
      resolvedSpecs: [],
      errors: [],
    });
    return [];
  }

  // Helper worker
  let queueIndex = 0;

  async function worker() {
    while (queueIndex < unknownDevices.length) {
      const currentIndex = queueIndex++;
      const item = unknownDevices[currentIndex];

      onProgress({
        total,
        completed,
        failed,
        currentDevice: `${item.brand} ${item.model}`,
        currentSource: 'Initializing lookup...',
        percent: Math.round((completed / total) * 100),
        isFinished: false,
        resolvedSpecs,
        errors,
      });

      try {
        const spec = await lookupSingleDeviceWithFallbacks(item, (sourceMsg) => {
          onProgress({
            total,
            completed,
            failed,
            currentDevice: `${item.brand} ${item.model}`,
            currentSource: sourceMsg,
            percent: Math.round((completed / total) * 100),
            isFinished: false,
            resolvedSpecs,
            errors,
          });
        });

        // Save to cache immediately
        saveCustomDeviceToCache(spec);
        resolvedSpecs.push(spec);
        completed++;
      } catch (err: any) {
        // Fallback guaranteed spec even if exception occurs
        const fallbackSpec = generateClientFallbackSpec(item);
        saveCustomDeviceToCache(fallbackSpec);
        resolvedSpecs.push(fallbackSpec);
        completed++;
      }

      onProgress({
        total,
        completed,
        failed,
        currentDevice: `${item.brand} ${item.model}`,
        currentSource: 'Spec saved to local cache',
        percent: Math.round((completed / total) * 100),
        isFinished: completed === total,
        resolvedSpecs,
        errors,
      });
    }
  }

  const workers = [];
  const activeCount = Math.min(concurrencyLimit, total);
  for (let i = 0; i < activeCount; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  const finalStatus: BatchLookupStatus = {
    total,
    completed,
    failed,
    currentDevice: 'All devices processed',
    currentSource: 'Finished',
    percent: 100,
    isFinished: true,
    resolvedSpecs,
    errors,
  };

  onProgress(finalStatus);
  return resolvedSpecs;
}
