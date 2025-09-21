"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const DEFAULT_IP_LOCATION = {
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
    },
    company: {
        name: 'Comcast Cable Communications, LLC',
        domain: 'comcast.com',
        type: 'isp'
    },
    privacy: {
        vpn: false,
        proxy: false,
        tor: false,
        relay: false,
        hosting: false,
        service: ''
    },
    abuse: {
        address: 'US, NJ, Mount Laurel, 1800 Bishops Gate Blvd, 08054',
        country: 'United States',
        email: 'abuse@comcast.net',
        name: 'Network Abuse and Policy Observance',
        network: '2603:300f::/32',
        phone: '+1-888-565-4329',
        countryCode: 'US'
    },
    /* @ts-ignore */
    domains: { page: 0, total: 0, domains: [] },
    countryCode: 'US',
    countryFlag: { emoji: '🇺🇸', unicode: 'U+1F1FA U+1F1F8' },
    countryFlagURL: 'https://cdn.ipinfo.io/static/images/countries-flags/US.svg',
    countryCurrency: { code: 'USD', symbol: '$' },
    continent: { code: 'NA', name: 'North America' },
    isEU: false
};
exports.default = DEFAULT_IP_LOCATION;
