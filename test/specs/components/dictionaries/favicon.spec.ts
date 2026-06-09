import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

describe('dictionary favicons', () => {
  it('uses DeepL branding for DeepL services instead of Google Translate', () => {
    const googleHash = hashFavicon('google')
    const deeplHash = hashFavicon('deepl')
    const deeplxHash = hashFavicon('deeplx')

    expect(deeplHash).toBe(deeplxHash)
    expect(deeplHash).not.toBe(googleHash)
  })
})

function hashFavicon(dictId: string): string {
  return crypto
    .createHash('sha256')
    .update(
      fs.readFileSync(
        path.join(
          __dirname,
          '../../../../src/components/dictionaries',
          dictId,
          'favicon.png'
        )
      )
    )
    .digest('hex')
}
