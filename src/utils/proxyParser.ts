import { ProxyItem, ProxyProtocol } from '../types';

export function parseProxyLine(line: string, defaultProtocol: ProxyProtocol = 'socks5', index: number = 0): ProxyItem {
  const raw = line.trim();
  const id = `proxy_${index}_${Math.random().toString(36).substring(2, 7)}`;

  if (!raw || raw.toLowerCase() === 'no proxy' || raw.toLowerCase() === 'noproxy' || raw.toLowerCase() === 'direct') {
    return {
      id,
      raw: raw || 'No Proxy',
      protocol: 'noproxy',
      host: '',
      port: '',
      isValid: true,
      formattedProxyUrl: '',
      formattedAdsPowerProxy: '',
    };
  }

  // Detect prefix protocol if present e.g. "socks5://host:port:user:pass"
  let protocol: ProxyProtocol = defaultProtocol;
  let cleanString = raw;

  if (cleanString.toLowerCase().startsWith('socks5://')) {
    protocol = 'socks5';
    cleanString = cleanString.substring(9);
  } else if (cleanString.toLowerCase().startsWith('http://')) {
    protocol = 'http';
    cleanString = cleanString.substring(7);
  } else if (cleanString.toLowerCase().startsWith('https://')) {
    protocol = 'https';
    cleanString = cleanString.substring(8);
  } else if (cleanString.toLowerCase().startsWith('ssh://')) {
    protocol = 'ssh';
    cleanString = cleanString.substring(6);
  }

  let host = '';
  let port = '';
  let username: string | undefined = undefined;
  let password: string | undefined = undefined;

  // Format A: username:password@host:port
  if (cleanString.includes('@')) {
    const [auth, server] = cleanString.split('@');
    if (auth && server) {
      const authParts = auth.split(':');
      username = authParts[0];
      password = authParts[1] || '';

      const serverParts = server.split(':');
      host = serverParts[0];
      port = serverParts[1] || '';
    }
  } else {
    // Format B & C: host:port:user:password OR host:port
    const parts = cleanString.split(':');
    if (parts.length >= 2) {
      host = parts[0];
      port = parts[1];
      if (parts.length >= 4) {
        username = parts[2];
        password = parts[3];
      }
    }
  }

  const isValid = Boolean(host && port && !isNaN(Number(port)));

  let formattedAdsPowerProxy = '';
  let formattedProxyUrl = '';

  if (isValid) {
    if (username && password) {
      formattedAdsPowerProxy = `${host}:${port}:${username}:${password}`;
    } else {
      formattedAdsPowerProxy = `${host}:${port}`;
    }
  }

  // Leave proxyurl blank unless user explicitly provided a Proxy Refresh URL
  const refreshUrlMatch = raw.match(/(?:refresh_url|proxy_url|proxyurl)=([^\s;]+)/i);
  if (refreshUrlMatch) {
    formattedProxyUrl = refreshUrlMatch[1];
  }

  return {
    id,
    raw,
    protocol,
    host,
    port,
    username,
    password,
    isValid,
    formattedProxyUrl,
    formattedAdsPowerProxy,
  };
}

export function parseMultipleProxies(rawText: string, defaultProtocol: ProxyProtocol = 'socks5'): ProxyItem[] {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  return lines.map((line, idx) => parseProxyLine(line, defaultProtocol, idx));
}
