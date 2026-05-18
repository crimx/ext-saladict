import { createCookieHeaderNetworkCompatibility } from '../network-compat'

export const ensureNetworkCompatibility = createCookieHeaderNetworkCompatibility(
  {
    origin: 'https://www.collinsdictionary.com',
    cookieDomain: 'www.collinsdictionary.com',
    topLevelSite: 'https://collinsdictionary.com',
    urls: ['https://www.collinsdictionary.com/*'],
    ruleId: 32003,
    ruleRegexFilter: '^https://www\\.collinsdictionary\\.com/.*',
    fallbackCookieNames: ['cf_clearance']
  }
)
