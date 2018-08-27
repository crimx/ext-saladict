export function matchPatternToRegExpStr (pattern: string): string {
  if (pattern === '') {
    return '^(?:http|https|file|ftp|app):\/\/'
  }

  const schemeSegment = '(\\*|http|https|ws|wss|file|ftp)'
  const hostSegment = '(\\*|(?:\\*\\.)?(?:[^/*]+))?'
  const pathSegment = '(.*)'
  const matchPatternRegExp = new RegExp(
    `^${schemeSegment}://${hostSegment}/${pathSegment}$`
  )

  let match = matchPatternRegExp.exec(pattern)
  if (!match) {
    return ''
  }

  let [, scheme, host, path] = match
  if (!host) {
    return ''
  }

  let regex = '^'

  if (scheme === '*') {
    regex += '(http|https)'
  } else {
    regex += scheme
  }

  regex += '://'

  if (host && host === '*') {
    regex += '[^/]+?'
  } else if (host) {
    if (host.match(/^\*\./)) {
      regex += '[^/]*?'
      host = host.substring(2)
    }
    regex += host.replace(/\./g, '\\.')
  }

  if (path) {
    if (path === '*') {
      regex += '(/.*)?'
    } else if (path.charAt(0) !== '/') {
      regex += '/'
      regex += path.replace(/\./g, '\\.').replace(/\*/g, '.*?')
      regex += '/?'
    }
  }

  return regex + '$'
}
