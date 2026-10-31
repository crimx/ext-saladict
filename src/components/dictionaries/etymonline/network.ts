import { createCookieHeaderNetworkCompatibility } from '../network-compat'

export const ensureNetworkCompatibility = createCookieHeaderNetworkCompatibility(
  {
    origin: 'https://www.etymonline.com',
    cookieDomain: 'www.etymonline.com',
    topLevelSite: 'https://etymonline.com',
    urls: ['https://www.etymonline.com/*'],
    ruleId: 32004,
    ruleRegexFilter: '^https://www\\.etymonline\\.com/.*',
    fallbackCookieNames: ['cf_clearance'],
    deduplicateCookieNames: true
  }
)
