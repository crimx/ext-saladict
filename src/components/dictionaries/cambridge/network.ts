import { createCookieHeaderNetworkCompatibility } from '../network-compat'

export const ensureNetworkCompatibility = createCookieHeaderNetworkCompatibility(
  {
    origin: 'https://dictionary.cambridge.org',
    cookieDomain: 'dictionary.cambridge.org',
    topLevelSite: 'https://cambridge.org',
    urls: ['https://dictionary.cambridge.org/*'],
    ruleId: 32002,
    ruleRegexFilter: '^https://dictionary\\.cambridge\\.org/.*',
    fallbackCookieNames: ['cf_clearance']
  }
)
