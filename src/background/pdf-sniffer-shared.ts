import { AppConfig } from '@/app-config'

export type PdfSniffAction = 'open' | 'bypass'

type ResponseHeader = {
  name: string
  value?: string
}

export const PDF_VIEWER_PATH = 'assets/pdf/web/viewer.html'
export const PDF_AUTO_VIEWER_MARKER = 'saladict-pdf'
export const PDF_URL_REGEX_FILTER =
  '^https?://.*\\.[Pp][Dd][Ff](?:$|[?#].*)?'
export const HTTP_URL_REGEX_FILTER = '^https?://.*'

const PDF_URL_TESTER = /\.pdf(?:$|[?#].*)?/i

export function isLikelyPdfUrl(url: string) {
  return PDF_URL_TESTER.test(url)
}

export function isLocalFileUrl(url: string) {
  return url.startsWith('file://')
}

export function shouldEnableAutoPdfSniff(
  config: Pick<AppConfig, 'pdfSniff' | 'pdfStandalone'>
) {
  return !!config.pdfSniff && config.pdfStandalone !== 'manual'
}

export function getPdfSniffAction(
  url: string,
  config: Pick<
    AppConfig,
    'pdfSniff' | 'pdfStandalone' | 'pdfBlacklist' | 'pdfWhitelist'
  >
): PdfSniffAction | null {
  if (!shouldEnableAutoPdfSniff(config)) {
    return null
  }

  const matchURL = ([regexpSource]: ReadonlyArray<string>) =>
    new RegExp(regexpSource).test(url)

  return config.pdfBlacklist.some(matchURL) && !config.pdfWhitelist.some(matchURL)
    ? 'bypass'
    : 'open'
}

export function getOtherPdfSniffAction(
  url: string,
  config: Pick<
    AppConfig,
    'pdfSniff' | 'pdfStandalone' | 'pdfBlacklist' | 'pdfWhitelist'
  >
) {
  if (!isLikelyPdfUrl(url)) {
    return null
  }

  return getPdfSniffAction(url, config)
}

export function getHttpPdfSniffActionByUrl(
  url: string,
  config: Pick<
    AppConfig,
    'pdfSniff' | 'pdfStandalone' | 'pdfBlacklist' | 'pdfWhitelist'
  >
) {
  if (!isLikelyPdfUrl(url)) {
    return null
  }

  return getPdfSniffAction(url, config)
}

export function getHttpPdfSniffActionByHeaders(
  url: string,
  responseHeaders: ResponseHeader[] | undefined,
  config: Pick<
    AppConfig,
    'pdfSniff' | 'pdfStandalone' | 'pdfBlacklist' | 'pdfWhitelist'
  >
) {
  if (!responseHeaders) {
    return null
  }

  const contentTypeHeader = responseHeaders.find(
    ({ name }) => name.toLowerCase() === 'content-type'
  )

  if (!contentTypeHeader || !contentTypeHeader.value) {
    return null
  }

  const contentType = contentTypeHeader.value.toLowerCase()

  if (
    contentType.endsWith('pdf') ||
    (contentType === 'application/octet-stream' && isLikelyPdfUrl(url))
  ) {
    return getPdfSniffAction(url, config)
  }

  return null
}
