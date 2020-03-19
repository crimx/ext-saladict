module.exports = {
  manifest_version: 2,

  homepage_url: 'https://saladict.crimx.com/',

  minimum_chrome_version: '55',

  name: '__MSG_extension_name__',
  short_name: '__MSG_extension_short_name__',
  description: '__MSG_extension_description__',

  default_locale: 'zh_CN',

  icons: {
    '16': 'assets/icon-16.png',
    '48': 'assets/icon-48.png',
    '128': 'assets/icon-128.png'
  },

  commands: {
    'toggle-active': {
      description: '__MSG_command_toggle_active__'
    },
    'toggle-instant': {
      description: '__MSG_command_toggle_instant__'
    },
    'open-quick-search': {
      description: '__MSG_command_open_quick_search__'
    },
    'open-pdf': {
      description: '__MSG_command_open_pdf__'
    },
    'open-youdao': {
      description: '__MSG_command_open_youdao__'
    },
    'open-google': {
      description: '__MSG_command_open_google__'
    },
    'search-clipboard': {
      description: '__MSG_command_search_clipboard__'
    }
  },

  web_accessible_resources: [
    'assets/*',
    'audio-control.html',
    'quick-search.html'
  ],

  permissions: [
    '<all_urls>',
    'alarms',
    'clipboardRead',
    'contextMenus',
    'cookies',
    'notifications',
    'storage',
    'tabs',
    'unlimitedStorage',
    'webRequest',
    'webRequestBlocking'
  ],

  optional_permissions: ['clipboardWrite'],

  // PDF.js requires 'unsafe-eval'
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'"
}
