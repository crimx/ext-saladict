import fs from 'fs'
import path from 'path'

describe('i18n locale loader', () => {
  it('keeps the static locale context aligned with frontend namespaces', () => {
    const i18nSource = fs.readFileSync(
      path.join(__dirname, '../../../src/_helpers/i18n.ts'),
      'utf8'
    )
    const localeContextPattern = extractBasicLocaleContextPattern(i18nSource)

    expect(localeContextPattern.test('/zh-CN/options.ts')).toBe(true)
    expect(localeContextPattern.test('/en/common.ts')).toBe(true)
    expect(localeContextPattern.test('/zh-TW/wordpage.ts')).toBe(true)
    expect(localeContextPattern.test('/en/sync.ts')).toBe(false)
    expect(localeContextPattern.test('/manifest/en/messages.json')).toBe(false)
  })

  it('loads basic locales through a static webpack context', () => {
    const i18nSource = fs.readFileSync(
      path.join(__dirname, '../../../src/_helpers/i18n.ts'),
      'utf8'
    )

    expect(i18nSource).toContain("require.context(\n    '@/_locales'")
    expect(i18nSource).not.toContain('webpackMode: "lazy"')
  })
})

function extractBasicLocaleContextPattern(source: string): RegExp {
  const marker = "require.context(\n    '@/_locales'"
  const markerIndex = source.indexOf(marker)
  expect(markerIndex).toBeGreaterThan(-1)

  return extractRegexLiteral(source, markerIndex + marker.length)
}

function extractRegexLiteral(source: string, startIndex: number): RegExp {
  const patternStart = source.indexOf('/', startIndex)
  expect(patternStart).toBeGreaterThan(-1)

  let escaped = false
  let inCharacterClass = false

  for (let index = patternStart + 1; index < source.length; index++) {
    const char = source[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '[') {
      inCharacterClass = true
      continue
    }

    if (char === ']') {
      inCharacterClass = false
      continue
    }

    if (char === '/' && !inCharacterClass) {
      const pattern = source.slice(patternStart + 1, index)
      let flags = ''
      for (
        let flagIndex = index + 1;
        /[a-z]/i.test(source[flagIndex]);
        flagIndex++
      ) {
        flags += source[flagIndex]
      }
      return new RegExp(pattern, flags)
    }
  }

  throw new Error('Missing webpackInclude regex literal')
}
