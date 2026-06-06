# Machine Translators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Alibaba, Volcengine, and NiuTrans as configurable Saladict machine translation dictionaries with user-supplied API credentials.

**Architecture:** Implement three first-party dictionary providers under `src/components/dictionaries/<id>/` and register them through the existing dictionary/auth config systems. Add a small shared helper for local language detection, WebCrypto HMAC signing, language mapping, and standard machine translation result construction so provider engines stay focused.

**Tech Stack:** TypeScript, React, Axios, WebCrypto `crypto.subtle`, existing `MachineTrans` UI, Jest, `axios-mock-adapter`.

---

## File Structure

Create:

- `src/components/dictionaries/machine-custom.ts`: shared helper for custom machine translators.
- `src/components/dictionaries/alibaba/auth.ts`: Alibaba credential defaults and account URL.
- `src/components/dictionaries/alibaba/config.ts`: Alibaba machine dictionary config.
- `src/components/dictionaries/alibaba/engine.ts`: Alibaba request signing, request execution, response normalization.
- `src/components/dictionaries/alibaba/View.tsx`: re-export `MachineTrans`.
- `src/components/dictionaries/alibaba/_locales.ts`: Alibaba display names and machine option locales.
- `src/components/dictionaries/alibaba/_style.shadow.scss`: re-export `MachineTrans` styles.
- `src/components/dictionaries/alibaba/favicon.png`: icon asset.
- `src/components/dictionaries/volc/auth.ts`: Volcengine credential defaults and account URL.
- `src/components/dictionaries/volc/config.ts`: Volcengine machine dictionary config.
- `src/components/dictionaries/volc/engine.ts`: Volcengine V4 signing, request execution, response normalization.
- `src/components/dictionaries/volc/View.tsx`: re-export `MachineTrans`.
- `src/components/dictionaries/volc/_locales.ts`: Volcengine display names and machine option locales.
- `src/components/dictionaries/volc/_style.shadow.scss`: re-export `MachineTrans` styles.
- `src/components/dictionaries/volc/favicon.png`: icon asset.
- `src/components/dictionaries/niutrans/auth.ts`: NiuTrans credential defaults and account URL.
- `src/components/dictionaries/niutrans/config.ts`: NiuTrans machine dictionary config.
- `src/components/dictionaries/niutrans/engine.ts`: NiuTrans request execution and response normalization.
- `src/components/dictionaries/niutrans/View.tsx`: re-export `MachineTrans`.
- `src/components/dictionaries/niutrans/_locales.ts`: NiuTrans display names and machine option locales.
- `src/components/dictionaries/niutrans/_style.shadow.scss`: re-export `MachineTrans` styles.
- `src/components/dictionaries/niutrans/favicon.png`: icon asset.
- `test/specs/components/dictionaries/machine-custom.spec.ts`: shared helper tests.
- `test/specs/components/dictionaries/alibaba/engine.spec.ts`: Alibaba provider tests.
- `test/specs/components/dictionaries/volc/engine.spec.ts`: Volcengine provider tests.
- `test/specs/components/dictionaries/niutrans/engine.spec.ts`: NiuTrans provider tests.

Modify:

- `src/app-config/dicts.ts`: import/register three new dictionaries.
- `src/app-config/auth.ts`: import/register three new credential sets and account URLs.
- `test/specs/app-config/merge-config.spec.ts`: update expected auth keys and assert new auth fields are present after merge.

Do not modify:

- `src/app-config/index.ts` `ctxTrans`.
- `src/_helpers/translateCtx.ts`.

---

### Task 1: Shared Custom Machine Translator Helper

**Files:**

- Create: `src/components/dictionaries/machine-custom.ts`
- Create: `test/specs/components/dictionaries/machine-custom.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `test/specs/components/dictionaries/machine-custom.spec.ts`:

```ts
import {
  commonMachineLanguages,
  createLanguageHelper,
  credentialRequiredResult,
  emptyMachineResult,
  hmacBase64,
  hmacHex,
  normalizeMachineLanguage,
  percentEncodeRFC3986,
  sha256Hex
} from '@/components/dictionaries/machine-custom'

describe('machine-custom helpers', () => {
  beforeAll(() => {
    const nodeCrypto = require('crypto').webcrypto
    Object.defineProperty(global, 'crypto', {
      configurable: true,
      value: nodeCrypto
    })
  })

  it('detects common languages locally', async () => {
    const helper = createLanguageHelper(commonMachineLanguages)

    await expect(helper.detect('hello world')).resolves.toBe('en')
    await expect(helper.detect('你好')).resolves.toBe('zh-CN')
    await expect(helper.detect('こんにちは')).resolves.toBe('ja')
    await expect(helper.detect('안녕하세요')).resolves.toBe('ko')
    await expect(helper.detect('français')).resolves.toBe('fr')
    await expect(helper.detect('español')).resolves.toBe('es')
    await expect(helper.detect('größer')).resolves.toBe('de')
  })

  it('normalizes provider language codes back to Saladict language codes', () => {
    expect(normalizeMachineLanguage('zh')).toBe('zh-CN')
    expect(normalizeMachineLanguage('zh-cn')).toBe('zh-CN')
    expect(normalizeMachineLanguage('zh-tw')).toBe('zh-TW')
    expect(normalizeMachineLanguage('zh-hant')).toBe('zh-TW')
    expect(normalizeMachineLanguage('jp')).toBe('ja')
    expect(normalizeMachineLanguage('kr')).toBe('ko')
    expect(normalizeMachineLanguage('en')).toBe('en')
  })

  it('encodes RFC3986 query fragments for Aliyun signing', () => {
    expect(percentEncodeRFC3986("a b!*'()~")).toBe(
      'a%20b%21%2A%27%28%29~'
    )
  })

  it('hashes and signs with WebCrypto', async () => {
    await expect(sha256Hex('abc')).resolves.toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )

    await expect(
      hmacHex('SHA-256', 'key', 'The quick brown fox jumps over the lazy dog')
    ).resolves.toBe(
      'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8'
    )

    await expect(
      hmacBase64('SHA-1', 'key', 'The quick brown fox jumps over the lazy dog')
    ).resolves.toBe('3nybhbi3iqa8ino29wqQcBydtNk=')
  })

  it('builds standard empty and credential-required results', () => {
    const credential = credentialRequiredResult('alibaba', commonMachineLanguages)
    expect(credential.result.requireCredential).toBe(true)
    expect(credential.result.id).toBe('alibaba')
    expect(credential.result.searchText.paragraphs).toEqual([''])

    const empty = emptyMachineResult(
      'volc',
      'en',
      'zh-CN',
      commonMachineLanguages
    )
    expect(empty.result.id).toBe('volc')
    expect(empty.result.sl).toBe('en')
    expect(empty.result.tl).toBe('zh-CN')
    expect(empty.result.trans.paragraphs).toEqual([''])
  })
})
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run:

```bash
yarn test test/specs/components/dictionaries/machine-custom.spec.ts
```

Expected: FAIL because `src/components/dictionaries/machine-custom.ts` does not exist.

- [ ] **Step 3: Implement the shared helper**

Create `src/components/dictionaries/machine-custom.ts`:

```ts
import { DictID } from '@/app-config'
import { Language } from '@opentranslate/languages'
import {
  isContainChinese,
  isContainDeutsch,
  isContainEnglish,
  isContainFrench,
  isContainJapanese,
  isContainKorean,
  isContainSpanish
} from '@/_helpers/lang-check'
import { DictSearchResult } from './helpers'
import {
  MachineTranslateResult,
  machineResult
} from '@/components/MachineTrans/engine'

export const commonMachineLanguages = [
  'zh-CN',
  'zh-TW',
  'en',
  'ja',
  'ko',
  'fr',
  'de',
  'es',
  'ru'
] as const

export type CommonMachineLanguage = typeof commonMachineLanguages[number]

export interface LocalLanguageHelper<Lang extends Language = Language> {
  detect(text: string): Promise<Lang>
  getSupportLanguages(): Lang[]
}

export function createLanguageHelper<Lang extends Language>(
  langs: ReadonlyArray<Lang>
): LocalLanguageHelper<Lang> {
  const supported = langs.slice()
  return {
    async detect(text: string): Promise<Lang> {
      const detected = detectLocalLanguage(text)
      return (supported.includes(detected as Lang) ? detected : 'auto') as Lang
    },
    getSupportLanguages(): Lang[] {
      return supported.slice()
    }
  }
}

export function detectLocalLanguage(text: string): CommonMachineLanguage | 'auto' {
  if (isContainJapanese(text)) return 'ja'
  if (isContainKorean(text)) return 'ko'
  if (isContainChinese(text)) return 'zh-CN'
  if (isContainFrench(text)) return 'fr'
  if (isContainDeutsch(text)) return 'de'
  if (isContainSpanish(text)) return 'es'
  if (isContainEnglish(text)) return 'en'
  return 'auto'
}

export function normalizeMachineLanguage(lang: string): string {
  const normalized = lang.toLowerCase()
  switch (normalized) {
    case 'zh':
    case 'zh-cn':
    case 'zh_chs':
    case 'zh-chs':
    case 'zh-hans':
      return 'zh-CN'
    case 'cht':
    case 'zh-tw':
    case 'zh_cht':
    case 'zh-cht':
    case 'zh-hant':
      return 'zh-TW'
    case 'jp':
      return 'ja'
    case 'kr':
      return 'ko'
    default:
      return normalized
  }
}

export function credentialRequiredResult<ID extends DictID>(
  id: ID,
  langcodes: ReadonlyArray<string>
): DictSearchResult<MachineTranslateResult<ID>> {
  return machineResult(
    {
      result: {
        requireCredential: true,
        id,
        sl: 'auto',
        tl: 'auto',
        slInitial: 'hide',
        searchText: { paragraphs: [''] },
        trans: { paragraphs: [''] }
      }
    },
    langcodes
  )
}

export function emptyMachineResult<ID extends DictID>(
  id: ID,
  sl: string,
  tl: string,
  langcodes: ReadonlyArray<string>
): DictSearchResult<MachineTranslateResult<ID>> {
  return machineResult(
    {
      result: {
        id,
        sl,
        tl,
        slInitial: 'hide',
        searchText: { paragraphs: [''] },
        trans: { paragraphs: [''] }
      }
    },
    langcodes
  )
}

export function successMachineResult<ID extends DictID>({
  id,
  sl,
  tl,
  slInitial,
  sourceText,
  translatedText,
  langcodes
}: {
  id: ID
  sl: string
  tl: string
  slInitial: MachineTranslateResult<ID>['slInitial']
  sourceText: string
  translatedText: string
  langcodes: ReadonlyArray<string>
}): DictSearchResult<MachineTranslateResult<ID>> {
  return machineResult(
    {
      result: {
        id,
        sl,
        tl,
        slInitial,
        searchText: { paragraphs: splitParagraphs(sourceText) },
        trans: { paragraphs: splitParagraphs(translatedText) }
      }
    },
    langcodes
  )
}

export function splitParagraphs(text: string): string[] {
  const paragraphs = text.split(/\n+/).filter(Boolean)
  return paragraphs.length > 0 ? paragraphs : ['']
}

export function percentEncodeRFC3986(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, char =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  )
}

export function encodeSortedQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map(
      key =>
        `${percentEncodeRFC3986(key)}=${percentEncodeRFC3986(params[key])}`
    )
    .join('&')
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await getSubtleCrypto().digest(
    'SHA-256',
    new TextEncoder().encode(text)
  )
  return bytesToHex(new Uint8Array(digest))
}

export async function hmacHex(
  hash: 'SHA-1' | 'SHA-256',
  key: string | Uint8Array,
  text: string
): Promise<string> {
  return bytesToHex(await hmacBytes(hash, key, text))
}

export async function hmacBase64(
  hash: 'SHA-1' | 'SHA-256',
  key: string | Uint8Array,
  text: string
): Promise<string> {
  return bytesToBase64(await hmacBytes(hash, key, text))
}

export async function hmacBytes(
  hash: 'SHA-1' | 'SHA-256',
  key: string | Uint8Array,
  text: string
): Promise<Uint8Array> {
  const rawKey = typeof key === 'string' ? new TextEncoder().encode(key) : key
  const cryptoKey = await getSubtleCrypto().importKey(
    'raw',
    rawKey,
    { name: 'HMAC', hash: { name: hash } },
    false,
    ['sign']
  )
  const signature = await getSubtleCrypto().sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(text)
  )
  return new Uint8Array(signature)
}

function getSubtleCrypto(): SubtleCrypto {
  if (globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle
  }
  throw new Error('WebCrypto subtle API is unavailable.')
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return globalThis.btoa(binary)
}
```

- [ ] **Step 4: Run the helper tests to verify they pass**

Run:

```bash
yarn test test/specs/components/dictionaries/machine-custom.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/components/dictionaries/machine-custom.ts test/specs/components/dictionaries/machine-custom.spec.ts
git commit -m "feat(dicts): add custom machine translator helpers"
```

Expected: commit succeeds.

---

### Task 2: Alibaba Translate Provider

**Files:**

- Create: `src/components/dictionaries/alibaba/auth.ts`
- Create: `src/components/dictionaries/alibaba/config.ts`
- Create: `src/components/dictionaries/alibaba/engine.ts`
- Create: `src/components/dictionaries/alibaba/View.tsx`
- Create: `src/components/dictionaries/alibaba/_locales.ts`
- Create: `src/components/dictionaries/alibaba/_style.shadow.scss`
- Create: `src/components/dictionaries/alibaba/favicon.png`
- Create: `test/specs/components/dictionaries/alibaba/engine.spec.ts`

- [ ] **Step 1: Write the failing Alibaba tests**

Create `test/specs/components/dictionaries/alibaba/engine.spec.ts`:

```ts
import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import {
  ALIBABA_ENDPOINT,
  buildAlibabaSignedUrl,
  mapAlibabaLanguage,
  parseAlibabaTranslatedText,
  search
} from '@/components/dictionaries/alibaba/engine'

describe('alibaba translator', () => {
  beforeAll(() => {
    const nodeCrypto = require('crypto').webcrypto
    Object.defineProperty(global, 'crypto', {
      configurable: true,
      value: nodeCrypto
    })
  })

  it('maps Saladict language codes to Alibaba language codes', () => {
    expect(mapAlibabaLanguage('auto')).toBe('auto')
    expect(mapAlibabaLanguage('zh-CN')).toBe('zh')
    expect(mapAlibabaLanguage('zh-TW')).toBe('zh-tw')
    expect(mapAlibabaLanguage('en')).toBe('en')
  })

  it('builds a deterministic signed Aliyun URL', async () => {
    const url = await buildAlibabaSignedUrl(
      {
        accessKeyId: 'testid',
        accessKeySecret: 'testsecret',
        sourceText: 'hello',
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN'
      },
      new Date('2026-06-06T00:00:00Z'),
      'nonce'
    )

    expect(url.startsWith(ALIBABA_ENDPOINT + '?')).toBe(true)
    expect(url).toContain('Action=TranslateGeneral')
    expect(url).toContain('AccessKeyId=testid')
    expect(url).toContain('SourceText=hello')
    expect(url).toContain('SourceLanguage=en')
    expect(url).toContain('TargetLanguage=zh')
    expect(url).toContain('Signature=')
  })

  it('parses common Aliyun response shapes', () => {
    expect(
      parseAlibabaTranslatedText({
        Data: {
          Translated: '你好',
          DetectedLanguage: 'en'
        }
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: 'en' })

    expect(
      parseAlibabaTranslatedText({
        Data: JSON.stringify({
          Translated: '你好',
          DetectedLanguage: 'en'
        })
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: 'en' })
  })

  it('requires credentials before calling Alibaba', async () => {
    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('alibaba')
  })

  it('translates through Alibaba when credentials exist', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onGet(new RegExp('^https://mt.aliyuncs.com/')).reply(200, {
      Data: {
        Translated: '你好',
        DetectedLanguage: 'en'
      }
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.alibaba.accessKeyId = 'testid'
    ;(config as any).dictAuth.alibaba.accessKeySecret = 'testsecret'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('alibaba')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['你好'])

    mock.restore()
  })
})
```

- [ ] **Step 2: Run the Alibaba tests to verify they fail**

Run:

```bash
yarn test test/specs/components/dictionaries/alibaba/engine.spec.ts
```

Expected: FAIL because the Alibaba provider files do not exist.

- [ ] **Step 3: Add Alibaba config, auth, view, locales, and style**

Create `src/components/dictionaries/alibaba/auth.ts`:

```ts
export const auth = {
  accessKeyId: '',
  accessKeySecret: ''
}

export const url =
  'https://help.aliyun.com/zh/machine-translation/developer-reference/api-alimt-2018-10-12-overview'
```

Create `src/components/dictionaries/alibaba/config.ts`:

```ts
import {
  MachineDictItem,
  machineConfig
} from '@/components/MachineTrans/engine'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type AlibabaLanguage = Subunion<
  Language,
  'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru'
>

export type AlibabaConfig = MachineDictItem<AlibabaLanguage>

export default (): AlibabaConfig =>
  machineConfig<AlibabaConfig>(
    ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru'],
    {},
    {},
    {}
  )
```

Create `src/components/dictionaries/alibaba/View.tsx`:

```ts
export { MachineTrans as default } from '@/components/MachineTrans/MachineTrans'
```

Create `src/components/dictionaries/alibaba/_locales.ts`:

```ts
import { getMachineLocales } from '../locales'

export const locales = getMachineLocales({
  en: 'Alibaba Translate',
  'zh-CN': '阿里翻译',
  'zh-TW': '阿里翻譯'
})
```

Create `src/components/dictionaries/alibaba/_style.shadow.scss`:

```scss
@import '@/components/MachineTrans/MachineTrans.scss';
```

Create the icon asset by copying an existing neutral dictionary icon:

```powershell
New-Item -ItemType Directory -Force src/components/dictionaries/alibaba
Copy-Item src/components/dictionaries/google/favicon.png src/components/dictionaries/alibaba/favicon.png
```

- [ ] **Step 4: Implement Alibaba engine**

Create `src/components/dictionaries/alibaba/engine.ts`:

```ts
import axios from 'axios'
import memoizeOne from 'memoize-one'
import { SearchFunction, GetSrcPageFunction } from '../helpers'
import {
  MachineTranslatePayload,
  MachineTranslateResult,
  getMTArgs
} from '@/components/MachineTrans/engine'
import {
  commonMachineLanguages,
  createLanguageHelper,
  credentialRequiredResult,
  emptyMachineResult,
  encodeSortedQuery,
  hmacBase64,
  normalizeMachineLanguage,
  percentEncodeRFC3986,
  successMachineResult
} from '../machine-custom'
import { AlibabaLanguage } from './config'

export const ALIBABA_ENDPOINT = 'https://mt.aliyuncs.com/'

export const getTranslator = memoizeOne(() =>
  createLanguageHelper<AlibabaLanguage>(commonMachineLanguages as AlibabaLanguage[])
)

export const getSrcPage: GetSrcPageFunction = () =>
  'https://www.aliyun.com/product/ai/alimt'

export type AlibabaResult = MachineTranslateResult<'alibaba'>

export function mapAlibabaLanguage(lang: string): string {
  switch (lang) {
    case 'zh-CN':
      return 'zh'
    case 'zh-TW':
      return 'zh-tw'
    default:
      return lang
  }
}

export async function buildAlibabaSignedUrl(
  input: {
    accessKeyId: string
    accessKeySecret: string
    sourceText: string
    sourceLanguage: string
    targetLanguage: string
  },
  now = new Date(),
  nonce = Math.random()
    .toString(36)
    .slice(2)
): Promise<string> {
  const params: Record<string, string> = {
    AccessKeyId: input.accessKeyId,
    Action: 'TranslateGeneral',
    Format: 'JSON',
    FormatType: 'text',
    Scene: 'general',
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: nonce,
    SignatureVersion: '1.0',
    SourceLanguage: mapAlibabaLanguage(input.sourceLanguage),
    SourceText: input.sourceText,
    TargetLanguage: mapAlibabaLanguage(input.targetLanguage),
    Timestamp: now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: '2018-10-12'
  }
  const canonicalQuery = encodeSortedQuery(params)
  const stringToSign = `GET&%2F&${percentEncodeRFC3986(canonicalQuery)}`
  const signature = await hmacBase64(
    'SHA-1',
    `${input.accessKeySecret}&`,
    stringToSign
  )
  return `${ALIBABA_ENDPOINT}?${canonicalQuery}&Signature=${percentEncodeRFC3986(
    signature
  )}`
}

export function parseAlibabaTranslatedText(data: any): {
  translatedText: string
  detectedLanguage?: string
} {
  const rawData =
    typeof data?.Data === 'string'
      ? safeJsonParse(data.Data)
      : data?.Data || data?.data || data
  return {
    translatedText:
      rawData?.Translated ||
      rawData?.translated ||
      rawData?.TranslatedText ||
      rawData?.translatedText ||
      '',
    detectedLanguage:
      rawData?.DetectedLanguage ||
      rawData?.detectedLanguage ||
      rawData?.SourceLanguage
  }
}

export const search: SearchFunction<
  AlibabaResult,
  MachineTranslatePayload<AlibabaLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()
  const langcodes = translator.getSupportLanguages()
  const { sl, tl, text } = await getMTArgs(
    translator as any,
    rawText,
    profile.dicts.all.alibaba,
    config,
    payload
  )

  const accessKeyId = config.dictAuth.alibaba.accessKeyId
  const accessKeySecret = config.dictAuth.alibaba.accessKeySecret
  if (!accessKeyId || !accessKeySecret) {
    return credentialRequiredResult('alibaba', langcodes)
  }

  try {
    const url = await buildAlibabaSignedUrl({
      accessKeyId,
      accessKeySecret,
      sourceText: text,
      sourceLanguage: sl,
      targetLanguage: tl
    })
    const response = await axios.get(url)
    const parsed = parseAlibabaTranslatedText(response.data)
    if (!parsed.translatedText) {
      return emptyMachineResult('alibaba', sl, tl, langcodes)
    }
    return successMachineResult({
      id: 'alibaba',
      sl: normalizeMachineLanguage(parsed.detectedLanguage || sl),
      tl,
      slInitial: profile.dicts.all.alibaba.options.slInitial,
      sourceText: text,
      translatedText: parsed.translatedText,
      langcodes
    })
  } catch (e) {
    return emptyMachineResult('alibaba', sl, tl, langcodes)
  }
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text)
  } catch (e) {
    return {}
  }
}
```

- [ ] **Step 5: Run Alibaba tests**

Run:

```bash
yarn test test/specs/components/dictionaries/alibaba/engine.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/dictionaries/alibaba test/specs/components/dictionaries/alibaba
git commit -m "feat(dicts): add alibaba translator provider"
```

Expected: commit succeeds.

---

### Task 3: Volcengine Translate Provider

**Files:**

- Create: `src/components/dictionaries/volc/auth.ts`
- Create: `src/components/dictionaries/volc/config.ts`
- Create: `src/components/dictionaries/volc/engine.ts`
- Create: `src/components/dictionaries/volc/View.tsx`
- Create: `src/components/dictionaries/volc/_locales.ts`
- Create: `src/components/dictionaries/volc/_style.shadow.scss`
- Create: `src/components/dictionaries/volc/favicon.png`
- Create: `test/specs/components/dictionaries/volc/engine.spec.ts`

- [ ] **Step 1: Write the failing Volcengine tests**

Create `test/specs/components/dictionaries/volc/engine.spec.ts`:

```ts
import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import {
  VOLC_ENDPOINT,
  buildVolcSignedRequest,
  mapVolcLanguage,
  parseVolcTranslatedText,
  search
} from '@/components/dictionaries/volc/engine'

describe('volc translator', () => {
  beforeAll(() => {
    const nodeCrypto = require('crypto').webcrypto
    Object.defineProperty(global, 'crypto', {
      configurable: true,
      value: nodeCrypto
    })
  })

  it('maps Saladict language codes to Volcengine language codes', () => {
    expect(mapVolcLanguage('auto')).toBe('')
    expect(mapVolcLanguage('zh-CN')).toBe('zh')
    expect(mapVolcLanguage('zh-TW')).toBe('zh-Hant')
    expect(mapVolcLanguage('en')).toBe('en')
  })

  it('builds a signed Volcengine request', async () => {
    const request = await buildVolcSignedRequest(
      {
        accessKeyId: 'ak',
        secretAccessKey: 'sk',
        sourceText: 'hello',
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN'
      },
      new Date('2026-06-06T00:00:00Z')
    )

    expect(request.url).toBe(
      `${VOLC_ENDPOINT}?Action=TranslateText&Version=2020-06-01`
    )
    expect(request.body).toBe(
      JSON.stringify({
        SourceLanguage: 'en',
        TargetLanguage: 'zh',
        TextList: ['hello']
      })
    )
    expect(request.headers['Content-Type']).toBe('application/json')
    expect(request.headers['X-Date']).toBe('20260606T000000Z')
    expect(request.headers.Authorization).toContain('HMAC-SHA256 Credential=ak/')
    expect(request.headers.Authorization).toContain(
      'SignedHeaders=content-type;host;x-content-sha256;x-date'
    )
  })

  it('parses common Volcengine response shapes', () => {
    expect(
      parseVolcTranslatedText({
        TranslationList: [{ Translation: '你好', DetectedSourceLanguage: 'en' }]
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: 'en' })

    expect(
      parseVolcTranslatedText({
        ResponseMetadata: {},
        TranslationList: [{ Translation: '你好' }]
      })
    ).toEqual({ translatedText: '你好', detectedLanguage: undefined })
  })

  it('requires credentials before calling Volcengine', async () => {
    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('volc')
  })

  it('translates through Volcengine when credentials exist', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock
      .onPost(`${VOLC_ENDPOINT}?Action=TranslateText&Version=2020-06-01`)
      .reply(200, {
        TranslationList: [
          {
            Translation: '你好',
            DetectedSourceLanguage: 'en'
          }
        ]
      })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.volc.accessKeyId = 'ak'
    ;(config as any).dictAuth.volc.secretAccessKey = 'sk'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('volc')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['你好'])

    mock.restore()
  })
})
```

- [ ] **Step 2: Run the Volcengine tests to verify they fail**

Run:

```bash
yarn test test/specs/components/dictionaries/volc/engine.spec.ts
```

Expected: FAIL because the Volcengine provider files do not exist.

- [ ] **Step 3: Add Volcengine config, auth, view, locales, and style**

Create `src/components/dictionaries/volc/auth.ts`:

```ts
export const auth = {
  accessKeyId: '',
  secretAccessKey: ''
}

export const url = 'https://www.volcengine.com/docs/4640/65067'
```

Create `src/components/dictionaries/volc/config.ts`:

```ts
import {
  MachineDictItem,
  machineConfig
} from '@/components/MachineTrans/engine'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type VolcLanguage = Subunion<
  Language,
  'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru'
>

export type VolcConfig = MachineDictItem<VolcLanguage>

export default (): VolcConfig =>
  machineConfig<VolcConfig>(
    ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru'],
    {},
    {},
    {}
  )
```

Create `src/components/dictionaries/volc/View.tsx`:

```ts
export { MachineTrans as default } from '@/components/MachineTrans/MachineTrans'
```

Create `src/components/dictionaries/volc/_locales.ts`:

```ts
import { getMachineLocales } from '../locales'

export const locales = getMachineLocales({
  en: 'Volcengine Translate',
  'zh-CN': '火山翻译',
  'zh-TW': '火山翻譯'
})
```

Create `src/components/dictionaries/volc/_style.shadow.scss`:

```scss
@import '@/components/MachineTrans/MachineTrans.scss';
```

Create the icon asset by copying an existing neutral dictionary icon:

```powershell
New-Item -ItemType Directory -Force src/components/dictionaries/volc
Copy-Item src/components/dictionaries/google/favicon.png src/components/dictionaries/volc/favicon.png
```

- [ ] **Step 4: Implement Volcengine engine**

Create `src/components/dictionaries/volc/engine.ts`:

```ts
import axios from 'axios'
import memoizeOne from 'memoize-one'
import { SearchFunction, GetSrcPageFunction } from '../helpers'
import {
  MachineTranslatePayload,
  MachineTranslateResult,
  getMTArgs
} from '@/components/MachineTrans/engine'
import {
  commonMachineLanguages,
  createLanguageHelper,
  credentialRequiredResult,
  emptyMachineResult,
  hmacBytes,
  hmacHex,
  normalizeMachineLanguage,
  sha256Hex,
  successMachineResult
} from '../machine-custom'
import { VolcLanguage } from './config'

export const VOLC_HOST = 'translate.volcengineapi.com'
export const VOLC_ENDPOINT = `https://${VOLC_HOST}/`
const VOLC_QUERY = 'Action=TranslateText&Version=2020-06-01'
const VOLC_REGION = 'cn-north-1'
const VOLC_SERVICE = 'translate'
const VOLC_ALGORITHM = 'HMAC-SHA256'

export const getTranslator = memoizeOne(() =>
  createLanguageHelper<VolcLanguage>(commonMachineLanguages as VolcLanguage[])
)

export const getSrcPage: GetSrcPageFunction = () =>
  'https://www.volcengine.com/product/machine-translation'

export type VolcResult = MachineTranslateResult<'volc'>

export function mapVolcLanguage(lang: string): string {
  switch (lang) {
    case 'auto':
      return ''
    case 'zh-CN':
      return 'zh'
    case 'zh-TW':
      return 'zh-Hant'
    default:
      return lang
  }
}

export async function buildVolcSignedRequest(
  input: {
    accessKeyId: string
    secretAccessKey: string
    sourceText: string
    sourceLanguage: string
    targetLanguage: string
  },
  now = new Date()
): Promise<{ url: string; body: string; headers: Record<string, string> }> {
  const bodyPayload: {
    SourceLanguage?: string
    TargetLanguage: string
    TextList: string[]
  } = {
    SourceLanguage: mapVolcLanguage(input.sourceLanguage),
    TargetLanguage: mapVolcLanguage(input.targetLanguage),
    TextList: [input.sourceText]
  }
  if (!bodyPayload.SourceLanguage) {
    delete bodyPayload.SourceLanguage
  }

  const body = JSON.stringify(bodyPayload)
  const xDate = formatVolcDate(now)
  const shortDate = xDate.slice(0, 8)
  const payloadHash = await sha256Hex(body)
  const signedHeaders = 'content-type;host;x-content-sha256;x-date'
  const canonicalHeaders =
    `content-type:application/json\n` +
    `host:${VOLC_HOST}\n` +
    `x-content-sha256:${payloadHash}\n` +
    `x-date:${xDate}\n`
  const canonicalRequest =
    `POST\n/\n${VOLC_QUERY}\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    payloadHash
  const credentialScope = `${shortDate}/${VOLC_REGION}/${VOLC_SERVICE}/request`
  const stringToSign =
    `${VOLC_ALGORITHM}\n${xDate}\n${credentialScope}\n` +
    (await sha256Hex(canonicalRequest))
  const signingKey = await getVolcSigningKey(
    input.secretAccessKey,
    shortDate,
    VOLC_REGION,
    VOLC_SERVICE
  )
  const signature = await hmacHex('SHA-256', signingKey, stringToSign)

  return {
    url: `${VOLC_ENDPOINT}?${VOLC_QUERY}`,
    body,
    headers: {
      'Content-Type': 'application/json',
      Host: VOLC_HOST,
      'X-Content-Sha256': payloadHash,
      'X-Date': xDate,
      Authorization:
        `${VOLC_ALGORITHM} Credential=${input.accessKeyId}/${credentialScope}, ` +
        `SignedHeaders=${signedHeaders}, Signature=${signature}`
    }
  }
}

export async function getVolcSigningKey(
  secretAccessKey: string,
  shortDate: string,
  region: string,
  service: string
): Promise<Uint8Array> {
  const kDate = await hmacBytes('SHA-256', secretAccessKey, shortDate)
  const kRegion = await hmacBytes('SHA-256', kDate, region)
  const kService = await hmacBytes('SHA-256', kRegion, service)
  return hmacBytes('SHA-256', kService, 'request')
}

export function parseVolcTranslatedText(data: any): {
  translatedText: string
  detectedLanguage?: string
} {
  const item = data?.TranslationList?.[0] || data?.translationList?.[0] || {}
  return {
    translatedText: item.Translation || item.translation || item.TranslatedText || '',
    detectedLanguage:
      item.DetectedSourceLanguage ||
      item.detectedSourceLanguage ||
      data?.DetectedSourceLanguage
  }
}

export const search: SearchFunction<
  VolcResult,
  MachineTranslatePayload<VolcLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()
  const langcodes = translator.getSupportLanguages()
  const { sl, tl, text } = await getMTArgs(
    translator as any,
    rawText,
    profile.dicts.all.volc,
    config,
    payload
  )

  const accessKeyId = config.dictAuth.volc.accessKeyId
  const secretAccessKey = config.dictAuth.volc.secretAccessKey
  if (!accessKeyId || !secretAccessKey) {
    return credentialRequiredResult('volc', langcodes)
  }

  try {
    const request = await buildVolcSignedRequest({
      accessKeyId,
      secretAccessKey,
      sourceText: text,
      sourceLanguage: sl,
      targetLanguage: tl
    })
    const response = await axios.post(request.url, request.body, {
      headers: request.headers
    })
    const parsed = parseVolcTranslatedText(response.data)
    if (!parsed.translatedText) {
      return emptyMachineResult('volc', sl, tl, langcodes)
    }
    return successMachineResult({
      id: 'volc',
      sl: normalizeMachineLanguage(parsed.detectedLanguage || sl),
      tl,
      slInitial: profile.dicts.all.volc.options.slInitial,
      sourceText: text,
      translatedText: parsed.translatedText,
      langcodes
    })
  } catch (e) {
    return emptyMachineResult('volc', sl, tl, langcodes)
  }
}

function formatVolcDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
}
```

- [ ] **Step 5: Run Volcengine tests**

Run:

```bash
yarn test test/specs/components/dictionaries/volc/engine.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/dictionaries/volc test/specs/components/dictionaries/volc
git commit -m "feat(dicts): add volc translator provider"
```

Expected: commit succeeds.

---

### Task 4: NiuTrans Provider

**Files:**

- Create: `src/components/dictionaries/niutrans/auth.ts`
- Create: `src/components/dictionaries/niutrans/config.ts`
- Create: `src/components/dictionaries/niutrans/engine.ts`
- Create: `src/components/dictionaries/niutrans/View.tsx`
- Create: `src/components/dictionaries/niutrans/_locales.ts`
- Create: `src/components/dictionaries/niutrans/_style.shadow.scss`
- Create: `src/components/dictionaries/niutrans/favicon.png`
- Create: `test/specs/components/dictionaries/niutrans/engine.spec.ts`

- [ ] **Step 1: Write the failing NiuTrans tests**

Create `test/specs/components/dictionaries/niutrans/engine.spec.ts`:

```ts
import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import {
  NIUTRANS_ENDPOINT,
  buildNiuTransPayload,
  mapNiuTransLanguage,
  parseNiuTransTranslatedText,
  search
} from '@/components/dictionaries/niutrans/engine'

describe('niutrans translator', () => {
  it('maps Saladict language codes to NiuTrans language codes', () => {
    expect(mapNiuTransLanguage('auto')).toBe('auto')
    expect(mapNiuTransLanguage('zh-CN')).toBe('zh')
    expect(mapNiuTransLanguage('zh-TW')).toBe('cht')
    expect(mapNiuTransLanguage('en')).toBe('en')
  })

  it('builds NiuTrans form payload', () => {
    expect(
      buildNiuTransPayload({
        apikey: 'key',
        sourceText: 'hello',
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN'
      })
    ).toBe('from=en&to=zh&apikey=key&src_text=hello')
  })

  it('parses common NiuTrans response shapes', () => {
    expect(parseNiuTransTranslatedText({ tgt_text: '你好', from: 'en' })).toEqual({
      translatedText: '你好',
      detectedLanguage: 'en'
    })
    expect(parseNiuTransTranslatedText({ tgtText: '你好' })).toEqual({
      translatedText: '你好',
      detectedLanguage: undefined
    })
  })

  it('requires credentials before calling NiuTrans', async () => {
    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('niutrans')
  })

  it('translates through NiuTrans when credentials exist', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onPost(NIUTRANS_ENDPOINT).reply(200, {
      tgt_text: '你好',
      from: 'en'
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.niutrans.apikey = 'key'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.id).toBe('niutrans')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual(['你好'])

    mock.restore()
  })
})
```

- [ ] **Step 2: Run the NiuTrans tests to verify they fail**

Run:

```bash
yarn test test/specs/components/dictionaries/niutrans/engine.spec.ts
```

Expected: FAIL because the NiuTrans provider files do not exist.

- [ ] **Step 3: Add NiuTrans config, auth, view, locales, and style**

Create `src/components/dictionaries/niutrans/auth.ts`:

```ts
export const auth = {
  apikey: ''
}

export const url = 'https://niutrans.com/documents/contents/trans_detection'
```

Create `src/components/dictionaries/niutrans/config.ts`:

```ts
import {
  MachineDictItem,
  machineConfig
} from '@/components/MachineTrans/engine'
import { Language } from '@opentranslate/translator'
import { Subunion } from '@/typings/helpers'

export type NiuTransLanguage = Subunion<
  Language,
  'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru'
>

export type NiuTransConfig = MachineDictItem<NiuTransLanguage>

export default (): NiuTransConfig =>
  machineConfig<NiuTransConfig>(
    ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru'],
    {},
    {},
    {}
  )
```

Create `src/components/dictionaries/niutrans/View.tsx`:

```ts
export { MachineTrans as default } from '@/components/MachineTrans/MachineTrans'
```

Create `src/components/dictionaries/niutrans/_locales.ts`:

```ts
import { getMachineLocales } from '../locales'

export const locales = getMachineLocales({
  en: 'NiuTrans',
  'zh-CN': '小牛翻译',
  'zh-TW': '小牛翻譯'
})
```

Create `src/components/dictionaries/niutrans/_style.shadow.scss`:

```scss
@import '@/components/MachineTrans/MachineTrans.scss';
```

Create the icon asset by copying an existing neutral dictionary icon:

```powershell
New-Item -ItemType Directory -Force src/components/dictionaries/niutrans
Copy-Item src/components/dictionaries/google/favicon.png src/components/dictionaries/niutrans/favicon.png
```

- [ ] **Step 4: Implement NiuTrans engine**

Create `src/components/dictionaries/niutrans/engine.ts`:

```ts
import axios from 'axios'
import memoizeOne from 'memoize-one'
import { SearchFunction, GetSrcPageFunction } from '../helpers'
import {
  MachineTranslatePayload,
  MachineTranslateResult,
  getMTArgs
} from '@/components/MachineTrans/engine'
import {
  commonMachineLanguages,
  createLanguageHelper,
  credentialRequiredResult,
  emptyMachineResult,
  normalizeMachineLanguage,
  successMachineResult
} from '../machine-custom'
import { NiuTransLanguage } from './config'

export const NIUTRANS_ENDPOINT =
  'https://api.niutrans.com/NiuTransServer/translation'

export const getTranslator = memoizeOne(() =>
  createLanguageHelper<NiuTransLanguage>(
    commonMachineLanguages as NiuTransLanguage[]
  )
)

export const getSrcPage: GetSrcPageFunction = () => 'https://niutrans.com/trans'

export type NiuTransResult = MachineTranslateResult<'niutrans'>

export function mapNiuTransLanguage(lang: string): string {
  switch (lang) {
    case 'zh-CN':
      return 'zh'
    case 'zh-TW':
      return 'cht'
    default:
      return lang
  }
}

export function buildNiuTransPayload(input: {
  apikey: string
  sourceText: string
  sourceLanguage: string
  targetLanguage: string
}): string {
  const params = new URLSearchParams()
  params.set('from', mapNiuTransLanguage(input.sourceLanguage))
  params.set('to', mapNiuTransLanguage(input.targetLanguage))
  params.set('apikey', input.apikey)
  params.set('src_text', input.sourceText)
  return params.toString()
}

export function parseNiuTransTranslatedText(data: any): {
  translatedText: string
  detectedLanguage?: string
} {
  return {
    translatedText:
      data?.tgt_text || data?.tgtText || data?.translation || data?.translated || '',
    detectedLanguage: data?.from || data?.sourceLanguage || data?.detectedLanguage
  }
}

export const search: SearchFunction<
  NiuTransResult,
  MachineTranslatePayload<NiuTransLanguage>
> = async (rawText, config, profile, payload) => {
  const translator = getTranslator()
  const langcodes = translator.getSupportLanguages()
  const { sl, tl, text } = await getMTArgs(
    translator as any,
    rawText,
    profile.dicts.all.niutrans,
    config,
    payload
  )

  const apikey = config.dictAuth.niutrans.apikey
  if (!apikey) {
    return credentialRequiredResult('niutrans', langcodes)
  }

  try {
    const response = await axios.post(
      NIUTRANS_ENDPOINT,
      buildNiuTransPayload({
        apikey,
        sourceText: text,
        sourceLanguage: sl,
        targetLanguage: tl
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    const parsed = parseNiuTransTranslatedText(response.data)
    if (!parsed.translatedText) {
      return emptyMachineResult('niutrans', sl, tl, langcodes)
    }
    return successMachineResult({
      id: 'niutrans',
      sl: normalizeMachineLanguage(parsed.detectedLanguage || sl),
      tl,
      slInitial: profile.dicts.all.niutrans.options.slInitial,
      sourceText: text,
      translatedText: parsed.translatedText,
      langcodes
    })
  } catch (e) {
    return emptyMachineResult('niutrans', sl, tl, langcodes)
  }
}
```

- [ ] **Step 5: Run NiuTrans tests**

Run:

```bash
yarn test test/specs/components/dictionaries/niutrans/engine.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/dictionaries/niutrans test/specs/components/dictionaries/niutrans
git commit -m "feat(dicts): add niutrans translator provider"
```

Expected: commit succeeds.

---

### Task 5: Register Dictionaries and Auth Config

**Files:**

- Modify: `src/app-config/dicts.ts`
- Modify: `src/app-config/auth.ts`
- Modify: `test/specs/app-config/merge-config.spec.ts`

- [ ] **Step 1: Update the config merge test first**

Replace `test/specs/app-config/merge-config.spec.ts` with:

```ts
import { AppConfigMutable, getDefaultConfig } from '@/app-config'
import { mergeConfig } from '@/app-config/merge-config'

describe('mergeConfig', () => {
  it('drops unsupported dictionary auth entries and keeps supported credentials', () => {
    const oldConfig = getDefaultConfig() as AppConfigMutable

    oldConfig.dictAuth.baidu.appid = 'appid'
    oldConfig.dictAuth.baidu.key = 'key'
    ;(oldConfig.dictAuth as any).alibaba.accessKeyId = 'ak'
    ;(oldConfig.dictAuth as any).alibaba.accessKeySecret = 'sk'
    ;(oldConfig.dictAuth as any).volc.accessKeyId = 'volc-ak'
    ;(oldConfig.dictAuth as any).volc.secretAccessKey = 'volc-sk'
    ;(oldConfig.dictAuth as any).niutrans.apikey = 'niu-key'
    ;(oldConfig.dictAuth as any).sogou = {
      token: 'legacy'
    }

    const mergedConfig = mergeConfig(oldConfig)

    expect((mergedConfig.dictAuth as any).sogou).toBeUndefined()
    expect(mergedConfig.dictAuth.baidu).toEqual({
      appid: 'appid',
      key: 'key'
    })
    expect((mergedConfig.dictAuth as any).alibaba).toEqual({
      accessKeyId: 'ak',
      accessKeySecret: 'sk'
    })
    expect((mergedConfig.dictAuth as any).volc).toEqual({
      accessKeyId: 'volc-ak',
      secretAccessKey: 'volc-sk'
    })
    expect((mergedConfig.dictAuth as any).niutrans).toEqual({
      apikey: 'niu-key'
    })
    expect(Object.keys(mergedConfig.dictAuth).sort()).toEqual([
      'alibaba',
      'baidu',
      'caiyun',
      'niutrans',
      'tencent',
      'volc',
      'youdaotrans'
    ])
  })
})
```

- [ ] **Step 2: Run the config merge test to verify it fails**

Run:

```bash
yarn test test/specs/app-config/merge-config.spec.ts
```

Expected: FAIL because `dictAuth.alibaba`, `dictAuth.volc`, and `dictAuth.niutrans` are not registered.

- [ ] **Step 3: Register new dictionaries**

Modify `src/app-config/dicts.ts`:

```ts
import { SupportedLangs } from '@/_helpers/lang-check'

import alibaba from '@/components/dictionaries/alibaba/config'
import baidu from '@/components/dictionaries/baidu/config'
import bing from '@/components/dictionaries/bing/config'
import ahdict from '@/components/dictionaries/ahdict/config'
import oaldict from '@/components/dictionaries/oaldict/config'
import caiyun from '@/components/dictionaries/caiyun/config'
import cambridge from '@/components/dictionaries/cambridge/config'
import cobuild from '@/components/dictionaries/cobuild/config'
import etymonline from '@/components/dictionaries/etymonline/config'
import eudic from '@/components/dictionaries/eudic/config'
import google from '@/components/dictionaries/google/config'
import guoyu from '@/components/dictionaries/guoyu/config'
import hjdict from '@/components/dictionaries/hjdict/config'
import liangan from '@/components/dictionaries/liangan/config'
import longman from '@/components/dictionaries/longman/config'
import mojidict from '@/components/dictionaries/mojidict/config'
import naver from '@/components/dictionaries/naver/config'
import niutrans from '@/components/dictionaries/niutrans/config'
import renren from '@/components/dictionaries/renren/config'
// import shanbay from '@/components/dictionaries/shanbay/config'
import tencent from '@/components/dictionaries/tencent/config'
import urban from '@/components/dictionaries/urban/config'
import volc from '@/components/dictionaries/volc/config'
import vocabulary from '@/components/dictionaries/vocabulary/config'
import weblio from '@/components/dictionaries/weblio/config'
import weblioejje from '@/components/dictionaries/weblioejje/config'
import merriamwebster from '@/components/dictionaries/merriamwebster/config'
import wikipedia from '@/components/dictionaries/wikipedia/config'
import youdao from '@/components/dictionaries/youdao/config'
import youdaotrans from '@/components/dictionaries/youdaotrans/config'
import zdic from '@/components/dictionaries/zdic/config'

// For TypeScript to generate typings
// Follow alphabetical order for easy reading
export const defaultAllDicts = {
  alibaba: alibaba(),
  baidu: baidu(),
  bing: bing(),
  ahdict: ahdict(),
  oaldict: oaldict(),
  caiyun: caiyun(),
  cambridge: cambridge(),
  cobuild: cobuild(),
  etymonline: etymonline(),
  eudic: eudic(),
  google: google(),
  guoyu: guoyu(),
  hjdict: hjdict(),
  liangan: liangan(),
  longman: longman(),
  mojidict: mojidict(),
  naver: naver(),
  niutrans: niutrans(),
  renren: renren(),
  // shanbay: shanbay(),
  tencent: tencent(),
  urban: urban(),
  volc: volc(),
  vocabulary: vocabulary(),
  weblio: weblio(),
  weblioejje: weblioejje(),
  merriamwebster: merriamwebster(),
  wikipedia: wikipedia(),
  youdao: youdao(),
  youdaotrans: youdaotrans(),
  zdic: zdic()
}

export type AllDicts = typeof defaultAllDicts

export const getAllDicts = (): AllDicts =>
  JSON.parse(JSON.stringify(defaultAllDicts))

interface DictItemBase {
  lang: string
  selectionLang: SupportedLangs
  defaultUnfold: SupportedLangs
  selectionWC: {
    min: number
    max: number
  }
  preferredHeight: number
}

type DictItemWithOptions<
  Options extends
    | { [option: string]: number | boolean | string }
    | undefined = undefined
> = Options extends undefined
  ? DictItemBase
  : DictItemBase & { options: Options }

export type SelectOptions<
  Options extends
    | { [option: string]: number | boolean | string }
    | undefined = undefined,
  Key extends keyof Options = Options extends undefined ? never : keyof Options
> = {
  [opt in Key extends any
    ? Options[Key] extends string
      ? Key
      : never
    : never]: Options[opt][]
}

export type DictItem<
  Options extends
    | { [option: string]: number | boolean | string }
    | undefined = undefined,
  Key extends keyof Options = Options extends undefined ? never : keyof Options
> = Options extends undefined
  ? DictItemWithOptions
  : DictItemWithOptions<Options> &
      ((Key extends any
      ? Options[Key] extends string
        ? Key
        : never
      : never) extends never
        ? {}
        : {
            options_sel: SelectOptions<Options, Key>
          })
```

- [ ] **Step 4: Register new auth configs**

Modify `src/app-config/auth.ts`:

```ts
import {
  auth as alibaba,
  url as alibabaUrl
} from '@/components/dictionaries/alibaba/auth'
import {
  auth as baidu,
  url as baiduUrl
} from '@/components/dictionaries/baidu/auth'
import {
  auth as caiyun,
  url as caiyunUrl
} from '@/components/dictionaries/caiyun/auth'
import {
  auth as niutrans,
  url as niutransUrl
} from '@/components/dictionaries/niutrans/auth'
import {
  auth as tencent,
  url as tencentUrl
} from '@/components/dictionaries/tencent/auth'
import {
  auth as volc,
  url as volcUrl
} from '@/components/dictionaries/volc/auth'
import {
  auth as youdaotrans,
  url as youdaotransUrl
} from '@/components/dictionaries/youdaotrans/auth'

export const defaultDictAuths = {
  alibaba,
  baidu,
  caiyun,
  niutrans,
  tencent,
  volc,
  youdaotrans
}

export type DictAuths = typeof defaultDictAuths

export const defaultDictAuthUrls: { [id in keyof DictAuths]: string } = {
  alibaba: alibabaUrl,
  baidu: baiduUrl,
  caiyun: caiyunUrl,
  niutrans: niutransUrl,
  tencent: tencentUrl,
  volc: volcUrl,
  youdaotrans: youdaotransUrl
}

export const getDefaultDictAuths = (): DictAuths =>
  JSON.parse(JSON.stringify(defaultDictAuths))
```

- [ ] **Step 5: Run config merge test**

Run:

```bash
yarn test test/specs/app-config/merge-config.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Assert the new translators are not added to context translation**

Run:

```bash
rg -n "ctxTrans:|alibaba|volc|niutrans" src/app-config/index.ts src/_helpers/translateCtx.ts
```

Expected: `ctxTrans` still lists only existing engines; `alibaba`, `volc`, and `niutrans` do not appear in `src/app-config/index.ts` or `src/_helpers/translateCtx.ts`.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/app-config/dicts.ts src/app-config/auth.ts test/specs/app-config/merge-config.spec.ts
git commit -m "feat(dicts): register custom machine translators"
```

Expected: commit succeeds.

---

### Task 6: Final Verification

**Files:**

- Verify: all files modified in Tasks 1-5.

- [ ] **Step 1: Run targeted dictionary tests**

Run:

```bash
yarn test test/specs/components/dictionaries/machine-custom.spec.ts test/specs/components/dictionaries/alibaba/engine.spec.ts test/specs/components/dictionaries/volc/engine.spec.ts test/specs/components/dictionaries/niutrans/engine.spec.ts test/specs/app-config/merge-config.spec.ts
```

Expected: PASS.

- [ ] **Step 2: Run type-check**

Run:

```bash
yarn type-check
```

Expected: PASS.

- [ ] **Step 3: Run a development build**

Run:

```bash
yarn devbuild
```

Expected: build completes without missing dynamic imports for `View.tsx`, `_style.shadow.scss`, or `favicon.png`.

- [ ] **Step 4: Inspect git status**

Run:

```bash
git status --short
```

Expected: clean working tree after commits.

---

## Self-Review

- Spec coverage: The plan adds all three providers, account fields, dictionary registration, common language list, missing-credential behavior, provider tests, config merge tests, and explicitly verifies that `ctxTrans` is untouched.
- Placeholder scan: No task contains `TBD`, `TODO`, or deferred implementation instructions.
- Type consistency: Dictionary IDs are `alibaba`, `volc`, and `niutrans`; auth keys are `accessKeyId`/`accessKeySecret`, `accessKeyId`/`secretAccessKey`, and `apikey`; those names match the design spec and registration tests.
