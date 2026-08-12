import {
  AdsPowerProfile,
  ParsedUA,
  ProfileNameType,
  ProxyItem,
  ProfileStatus,
  ProfileBatchCount,
} from '../types';
import { getDeviceSpecsForParsedUA } from './uaParser';

export interface GeneratorOptions {
  parsedUAs: ParsedUA[];
  proxies: ProxyItem[];
  tabs: string[];
  namingType: ProfileNameType;
  customPrefix: string;
  targetCount: ProfileBatchCount | number;
  defaultRemark?: string;
}

export function generateAdsPowerProfiles(options: GeneratorOptions): AdsPowerProfile[] {
  const {
    parsedUAs,
    proxies,
    tabs,
    namingType,
    customPrefix,
    targetCount,
    defaultRemark,
  } = options;

  if (parsedUAs.length === 0) return [];

  const profiles: AdsPowerProfile[] = [];
  const tabString = tabs.join(',');

  for (let i = 0; i < targetCount; i++) {
    const uaIndex = i % parsedUAs.length;
    const parsedUA = parsedUAs[uaIndex];
    const specs = getDeviceSpecsForParsedUA(parsedUA);

    // Proxy mapping
    let assignedProxy: ProxyItem | undefined = undefined;
    if (proxies.length > 0) {
      assignedProxy = proxies[i % proxies.length];
    }

    // Name generation
    const padNumber = String(i + 1).padStart(
      targetCount >= 1000 ? 5 : targetCount >= 100 ? 4 : 3,
      '0'
    );

    let profileName = '';
    if (namingType === 'sequential') {
      profileName = `Profile-${padNumber}`;
    } else if (namingType === 'random') {
      const cleanModel = specs.model.replace(/[^a-zA-Z0-9]/g, '');
      profileName = `${cleanModel || 'Profile'}-${padNumber}`;
    } else if (namingType === 'custom_prefix') {
      const prefix = customPrefix.trim() || 'Profile';
      profileName = `${prefix}-${padNumber}`;
    }

    // Determine profile status
    let status: ProfileStatus = 'Ready';
    if (!parsedUA.isValidUA) {
      status = 'Invalid UA';
    } else if (parsedUA.isUnknownDevice) {
      status = 'Unknown Device';
    } else if (proxies.length === 0 || (assignedProxy && assignedProxy.protocol === 'noproxy')) {
      status = 'Proxy Missing';
    } else if (parsedUA.brand !== 'Unknown' && !parsedUA.matchedDevice) {
      status = 'Estimated Device';
    }

    // Remark string
    const autoRemark = `${parsedUA.osName} ${parsedUA.osVersion || ''} | ${specs.brand} ${specs.model} | ${parsedUA.browserName} ${parsedUA.browserVersion || ''}`.trim();
    const finalRemark = defaultRemark ? `${defaultRemark} (${autoRemark})` : autoRemark;

    // Proxy fields
    const proxyTypeStr = assignedProxy && assignedProxy.isValid ? assignedProxy.protocol : 'noproxy';
    const proxyStr = assignedProxy && assignedProxy.isValid ? assignedProxy.formattedAdsPowerProxy : '';
    const proxyUrlStr = assignedProxy && assignedProxy.isValid ? assignedProxy.formattedProxyUrl : '';

    const profile: AdsPowerProfile = {
      id: `profile_${i + 1}_${Math.random().toString(36).substring(2, 7)}`,
      index: i + 1,
      name: profileName,
      remark: finalRemark,
      tab: tabString,
      platform: '',
      username: '',
      password: '',
      fakey: '',
      cookie: '',
      proxytype: proxyTypeStr,
      ipchecker: '',
      proxy: proxyStr,
      proxyurl: proxyUrlStr,
      ip: '',
      countrycode: '',
      regioncode: '',
      citycode: '',
      proxyid: '',
      ua: parsedUA.rawUA,
      resolution: specs.nativeResolution,
      parsedUA,
      assignedProxy,
      status,
      tabsList: tabs,
    };

    profiles.push(profile);
  }

  return profiles;
}

/**
 * Formats a list of profiles into official AdsPower Bulk Import TXT output.
 * Output includes ONLY official AdsPower fields separated by ************************************
 */
export function formatAdsPowerTXT(profiles: AdsPowerProfile[]): string {
  if (profiles.length === 0) return '';

  const blocks = profiles.map((p) => {
    return [
      `name=${p.name}`,
      `remark=${p.remark}`,
      `tab=${p.tab}`,
      `platform=${p.platform}`,
      `username=${p.username}`,
      `password=${p.password}`,
      `fakey=${p.fakey}`,
      `cookie=${p.cookie}`,
      `proxytype=${p.proxytype}`,
      `ipchecker=${p.ipchecker}`,
      `proxy=${p.proxy}`,
      `proxyurl=${p.proxyurl}`,
      `ip=${p.ip}`,
      `countrycode=${p.countrycode}`,
      `regioncode=${p.regioncode}`,
      `citycode=${p.citycode}`,
      `proxyid=${p.proxyid}`,
      `ua=${p.ua}`,
      `resolution=${p.resolution}`,
      `************************************`,
    ].join('\n');
  });

  return blocks.join('\n');
}

/**
 * Formats a single profile into AdsPower TXT block
 */
export function formatSingleProfileTXT(p: AdsPowerProfile): string {
  return [
    `name=${p.name}`,
    `remark=${p.remark}`,
    `tab=${p.tab}`,
    `platform=${p.platform}`,
    `username=${p.username}`,
    `password=${p.password}`,
    `fakey=${p.fakey}`,
    `cookie=${p.cookie}`,
    `proxytype=${p.proxytype}`,
    `ipchecker=${p.ipchecker}`,
    `proxy=${p.proxy}`,
    `proxyurl=${p.proxyurl}`,
    `ip=${p.ip}`,
    `countrycode=${p.countrycode}`,
    `regioncode=${p.regioncode}`,
    `citycode=${p.citycode}`,
    `proxyid=${p.proxyid}`,
    `ua=${p.ua}`,
    `resolution=${p.resolution}`,
    `************************************`,
  ].join('\n');
}
