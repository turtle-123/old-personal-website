import type { IPinfo } from "node-ipinfo";
function generateRandomIP() {
  let ip = "";
  for (let i = 0; i < 4; i++) {
    ip += Math.floor(Math.random() * 256) + ".";
  }
  return ip.slice(0, -1); // Remove the trailing dot
}
/**
 * Default IP Info Object - also gives you a sense of what the IP Info object looks like
 */
const DEFAULT_IP_LOCATION: IPinfo = {
    ip: generateRandomIP(),
    city: 'Random Place',
    region: 'Random State',
    country: 'United States',
    loc: '39.1653,-86.5264',
    postal: '47405',
    timezone: 'America/Indiana/Indianapolis',
    asn: {
      asn: 'AS7922',
      name: 'Comcast Cable Communications, LLC',
      domain: 'comcast.com',
      route: '2603:3000::/24',
      type: 'isp'
    } as const,
    company: {
      name: 'Comcast Cable Communications, LLC',
      domain: 'comcast.com',
      type: 'isp'
    } as const,
    privacy: {
      vpn: false,
      proxy: false,
      tor: false,
      relay: false,
      hosting: false,
      service: ''
    } as const,
    abuse: {
      address: 'US, NJ, Mount Laurel, 1800 Bishops Gate Blvd, 08054',
      country: 'United States',
      email: 'abuse@comcast.net',
      name: 'Network Abuse and Policy Observance',
      network: '2603:300f::/32',
      phone: '+1-888-565-4329',
      countryCode: 'US'
    } as const,
    /* @ts-ignore */
    domains: { page: 0, total: 0, domains: [] } as const,
    countryCode: 'US',
    countryFlag: { emoji: '🇺🇸', unicode: 'U+1F1FA U+1F1F8' } as const,
    countryFlagURL: 'https://cdn.ipinfo.io/static/images/countries-flags/US.svg',
    countryCurrency: { code: 'USD', symbol: '$' } as const,
    continent: { code: 'NA', name: 'North America' } as const,
    isEU: false
}
export default DEFAULT_IP_LOCATION;