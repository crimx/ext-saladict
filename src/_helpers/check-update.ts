export interface ReleaseData {
  version: string
  data: string[]
}

/**
 * 3 major newer
 * 2 minor newer
 * 1 patch newer
 * 0 same version
 * -1 patch older
 * -2 minor older
 * -3 major older
 */
export type VersionDiff = number

export type ReleaseResponse = {
  diff: VersionDiff
  data?: ReleaseData
}

export async function checkUpdate(
  compareVersion?: string,
  data?: ReleaseData
): Promise<ReleaseResponse> {
  if (!data) {
    try {
      const isZh = window.appConfig.langCode.startsWith('zh')
      const response = await fetch(
        `https://saladict.crimx.com/releases/${isZh ? 'chs' : 'eng'}.json`
      )
      data = await response.json()
    } catch (e) {
      console.error(e)
    }
  }

  if (!data) {
    return { diff: 0 }
  }

  if (!compareVersion) {
    return { diff: 3, data }
  }

  const prev = compareVersion.split('.').map(Number)
  const curr = data.version
    .slice(1)
    .split('.')
    .map(Number)

  for (let i = 0; i < 3; i++) {
    if (curr[i] > prev[i]) {
      return { diff: 3 - i, data }
    }
    if (curr[i] < prev[i]) {
      return { diff: i - 3, data }
    }
  }

  return { diff: 0, data }
}
