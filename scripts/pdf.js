/** !
 * Upgrade PDF.js
 */

const path = require('path')
const fs = require('fs-extra')
const fetch = require('node-fetch')
const extractZip = require('extract-zip')
const randomMua = require('random-mua')
const dotenv = require('dotenv')

const rootDir = path.join(__dirname, '..')
const envPath = path.join(rootDir, '.env')
const pdfJSVersionEnvName = 'PDFJS_VERSION'
const pdfJSLatestReleaseURL =
  'https://api.github.com/repos/mozilla/pdf.js/releases/latest'
const pdfJSReleaseURL = tag =>
  `https://api.github.com/repos/mozilla/pdf.js/releases/tags/${encodeURIComponent(
    tag
  )}`
const pdfJSRequestHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': randomMua()
}
const cacheDir = path.join(__dirname, 'pdf')
const archivePath = path.join(__dirname, 'pdfjs-dist.zip')
const repoRoot = cacheDir
const publicPDFRoot = path.join(rootDir, 'assets/pdf')
const forceLatestPDFJS = process.argv.includes('--force')
const viewerScriptCandidates = ['web/viewer.js', 'web/viewer.mjs']
const buildScriptCandidates = ['build/pdf.js', 'build/pdf.mjs']
const workerScriptCandidates = ['build/pdf.worker.js', 'build/pdf.worker.mjs']
const pdfViewerThemeBootstrapFile = 'web/saladict-viewer-theme.js'
const webFileCandidates = [
  'web/debugger.js',
  'web/debugger.mjs',
  'web/debugger.css',
  pdfViewerThemeBootstrapFile,
  'web/viewer.js',
  'web/viewer.mjs',
  'web/viewer.html',
  'web/viewer.css'
]
const pdfDirs = [
  'web/cmaps',
  'web/iccs',
  'web/images',
  'web/standard_fonts',
  'web/wasm'
]
const localeDir = 'web/locale'
const pdfViewerThemeBootstrap = `
;(function () {
  var darkMode = null
  var prefs = {}
  var prefsText = null

  try {
    darkMode = localStorage.getItem('saladict-pdf-viewer-dark-mode')
    prefsText = localStorage.getItem('pdfjs.preferences')
  } catch (error) {
    darkMode = null
    prefsText = null
  }

  if (darkMode !== '0' && darkMode !== '1' && darkMode !== 'follow') {
    return
  }

  if (prefsText) {
    try {
      prefs = JSON.parse(prefsText) || {}
    } catch (error) {
      prefs = {}
    }
  }

  prefs.viewerCssTheme = darkMode === 'follow' ? 0 : darkMode === '1' ? 2 : 1

  try {
    localStorage.setItem('pdfjs.preferences', JSON.stringify(prefs))
  } catch (error) {
    /* ignore localStorage failures */
  }
})()
`

startUpgrade().catch(error => {
  console.error(error)
  process.exit(1)
})

async function startUpgrade() {
  const pdfJSVersion = await downloadPDFJS()

  console.log('\nChecking files.')
  const viewerScriptPath = await findExistingPath(
    viewerScriptCandidates,
    'PDF.js viewer script'
  )
  await findExistingPath(buildScriptCandidates, 'PDF.js build script')
  await findExistingPath(workerScriptCandidates, 'PDF.js worker script')
  await exists(path.join(repoRoot, 'web/viewer.html'))
  await exists(path.join(repoRoot, 'web/viewer.css'))

  console.log('\nModifying files.')
  await Promise.all([modifyViewerJS(viewerScriptPath), modifyViewerHTML()])

  await fs.ensureDir(publicPDFRoot)

  console.log('\nCloning files.')
  await cleanInit()

  await cloneFiles()

  console.log('\nCleaning files.')
  await fs.remove(cacheDir)

  await writePDFJSVersion(pdfJSVersion)

  console.log('\ndone.')
}

async function downloadPDFJS() {
  await fs.remove(cacheDir)
  await fs.remove(archivePath)

  try {
    const lockedVersion = forceLatestPDFJS ? '' : getLockedPDFJSVersion()
    const { asset, releaseName, version } = await getPDFJSArchive(lockedVersion)
    const versionLabel = lockedVersion
      ? `${version} (locked)`
      : `${version}${forceLatestPDFJS ? ' (forced latest)' : ''}`

    console.log(
      `Downloading PDF.js ${versionLabel} from ${releaseName} (${asset.name}).`
    )
    await downloadFile(asset.browser_download_url, archivePath)

    console.log('Extracting PDF.js.')
    await fs.ensureDir(cacheDir)
    await extractZip(archivePath, { dir: cacheDir })

    return version
  } finally {
    await fs.remove(archivePath)
  }
}

function getLockedPDFJSVersion() {
  const env = dotenv.config({ path: envPath }).parsed || {}
  const version = env[pdfJSVersionEnvName]

  return typeof version === 'string' && version.trim() ? version.trim() : ''
}

async function getPDFJSArchive(version) {
  const releaseTag = version ? normalizePDFJSReleaseTag(version) : ''
  const release = await fetchPDFJSRelease(
    releaseTag ? pdfJSReleaseURL(releaseTag) : pdfJSLatestReleaseURL,
    releaseTag || 'latest'
  )
  const assets = release.assets || []
  const asset =
    assets.find(
      asset =>
        /^pdfjs-.+-dist\.zip$/i.test(asset.name) &&
        !/-legacy-dist\.zip$/i.test(asset.name)
    ) || assets.find(asset => /^pdfjs-.+-legacy-dist\.zip$/i.test(asset.name))

  if (!asset || !asset.browser_download_url) {
    const releaseName =
      release.tag_name || release.name || releaseTag || 'latest'
    throw new Error(`Could not find PDF.js dist zip in ${releaseName}`)
  }

  const releaseName =
    release.tag_name || release.name || releaseTag || 'latest release'

  return {
    asset,
    releaseName,
    version: getPDFJSArchiveVersion(asset, releaseName)
  }
}

async function fetchPDFJSRelease(url, releaseName) {
  const response = await fetch(url, {
    headers: pdfJSRequestHeaders
  })

  if (!response.ok) {
    throw new Error(
      await formatResponseError(
        response,
        `Fetch PDF.js ${releaseName} release failed`
      )
    )
  }

  return response.json()
}

function normalizePDFJSReleaseTag(version) {
  return version[0].toLowerCase() === 'v' ? version : `v${version}`
}

function getPDFJSArchiveVersion(asset, releaseName) {
  const assetMatch = asset.name.match(/^pdfjs-(.+?)-(?:legacy-)?dist\.zip$/i)

  if (assetMatch) {
    return trimVersionTag(assetMatch[1])
  }

  return trimVersionTag(releaseName)
}

function trimVersionTag(version) {
  return String(version)
    .trim()
    .replace(/^v/i, '')
}

async function downloadFile(url, targetPath) {
  const response = await fetch(url, { headers: pdfJSRequestHeaders })

  if (!response.ok) {
    throw new Error(await formatResponseError(response, 'Download failed'))
  }

  await fs.ensureFile(targetPath)

  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(targetPath)

    response.body.on('error', reject)
    fileStream.on('finish', resolve)
    fileStream.on('error', reject)
    response.body.pipe(fileStream)
  })
}

async function formatResponseError(response, message) {
  const text = await response.text()
  return `${message}: ${response.status} ${response.statusText}${
    text ? `\n${text}` : ''
  }`
}

async function writePDFJSVersion(version) {
  if (!version) {
    throw new Error(`Could not determine ${pdfJSVersionEnvName}`)
  }

  const nextLine = `${pdfJSVersionEnvName}=${trimVersionTag(version)}`
  const envText = await fs.readFile(envPath, 'utf8').catch(error => {
    if (error && error.code === 'ENOENT') {
      return ''
    }

    throw error
  })
  const lineEnding = envText.includes('\r\n') ? '\r\n' : '\n'
  const lines = envText.split(/\r?\n/)
  const envLinePattern = new RegExp(
    `^\\s*(?:export\\s+)?${escapeRegExp(pdfJSVersionEnvName)}\\s*=`
  )
  let updated = false

  for (let i = 0; i < lines.length; i++) {
    if (envLinePattern.test(lines[i])) {
      lines[i] = nextLine
      updated = true
      break
    }
  }

  if (updated) {
    await fs.outputFile(envPath, lines.join(lineEnding))
    return
  }

  const separator =
    envText && !envText.endsWith('\n') && !envText.endsWith('\r')
      ? lineEnding
      : ''
  const sectionBreak = envText ? lineEnding : ''

  await fs.outputFile(
    envPath,
    `${envText}${separator}${sectionBreak}${nextLine}${lineEnding}`
  )
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function modifyViewerJS(viewerPath) {
  const viewerName = path.basename(viewerPath)
  let file = await fs.readFile(viewerPath, 'utf8')

  file = '/* saladict */ window.__SALADICT_PDF_PAGE__ = true;\n' + file

  // change default pdf
  const defaultPDFTester = /defaultUrl = {[\s\S]*?value: (['"]\S+?.pdf['"]),[\s\S]*?kind: OptionKind\.VIEWER/
  if (!defaultPDFTester.test(file)) {
    throw new Error(`Could not locate default pdf in ${viewerName}`)
  }
  file = file.replace(defaultPDFTester, (m, p1) =>
    m.replace(p1, "/* saladict */'/assets/default.pdf'")
  )

  // disable url check
  const validateTester = /validateFileURL\(file\);/
  if (!validateTester.test(file)) {
    throw new Error(`Could not locate validateFileURL in ${viewerName}`)
  }
  file = file.replace(validateTester, '/* saladict */')

  const autoViewerTester = /file = params\.get\("file"\) \?\? ((_app_options\.)?AppOptions)\.get\("defaultUrl"\);/
  if (!autoViewerTester.test(file)) {
    throw new Error(`Could not locate default viewer url in ${viewerName}`)
  }
  file = file.replace(
    autoViewerTester,
    (m, appOptions) =>
      `file = params.get("file") ?? (params.get("saladict-pdf") === "1" ? "" : ${appOptions}.get("defaultUrl")); /* saladict */`
  )

  await fs.writeFile(viewerPath, file)
}

async function modifyViewerHTML() {
  const viewerPath = path.join(repoRoot, 'web/viewer.html')
  let file = await fs.readFile(viewerPath, 'utf8')

  const viewerCSSTester = /<link rel="stylesheet" href="viewer\.css"\s*\/?>/

  if (!viewerCSSTester.test(file)) {
    throw new Error('Could not locate viewer.css in viewer.html')
  }

  if (!file.includes(`</body>`)) {
    throw new Error('Could not locate </body> in viewer.html')
  }

  file = file.replace(
    viewerCSSTester,
    m =>
      `${m}\n    <script src="${path.basename(
        pdfViewerThemeBootstrapFile
      )}"></script>`
  )

  // Load Saladict dict panel
  file = file.replace(
    `</body>`,
    `
    <!-- Saladict -->
    <script src="/assets/browser-polyfill.min.js"></script>
    <script src="/assets/pdf-viewer-bridge.js"></script>
    <script src="/assets/inject-dict-panel.js"></script>
  </body>
`
  )

  await fs.writeFile(
    path.join(repoRoot, pdfViewerThemeBootstrapFile),
    pdfViewerThemeBootstrap
  )
  await fs.writeFile(viewerPath, file)
}

function cleanInit() {
  return fs.emptyDir(publicPDFRoot)
}

async function exists(path) {
  try {
    await fs.access(path)
  } catch (e) {
    throw new Error(path + ' not exist')
  }
}

async function findExistingPath(relativePaths, label) {
  for (const relativePath of relativePaths) {
    const fullPath = path.join(repoRoot, relativePath)

    if (await fs.pathExists(fullPath)) {
      return fullPath
    }
  }

  throw new Error(`Could not locate ${label}`)
}

async function cloneFiles() {
  const pdfFiles = await collectPDFFiles()

  for (const pdfFile of pdfFiles) {
    const targetPath = path.join(publicPDFRoot, pdfFile)
    await fs.ensureFile(targetPath)
    await fs.copy(path.join(repoRoot, pdfFile), targetPath)
  }

  for (const pdfDir of await collectPDFDirs()) {
    const targetPath = path.join(publicPDFRoot, pdfDir)
    await fs.ensureDir(targetPath)
    await fs.copy(path.join(repoRoot, pdfDir), targetPath)
  }

  await cloneLocaleFiles()
}

async function collectPDFFiles() {
  return [
    ...(await collectBuildFiles()),
    ...(await collectExistingPaths(webFileCandidates))
  ]
}

async function collectBuildFiles() {
  const buildRoot = path.join(repoRoot, 'build')
  const buildFiles = await fs.readdir(buildRoot)
  const result = []

  for (const filename of buildFiles) {
    const fullPath = path.join(buildRoot, filename)
    const stat = await fs.stat(fullPath)

    if (stat.isFile() && !filename.endsWith('.map')) {
      result.push(path.join('build', filename))
    }
  }

  return result
}

async function collectPDFDirs() {
  return collectExistingPaths(pdfDirs)
}

async function collectExistingPaths(relativePaths) {
  const result = []

  for (const relativePath of relativePaths) {
    if (await fs.pathExists(path.join(repoRoot, relativePath))) {
      result.push(relativePath)
    }
  }

  return result
}

async function cloneLocaleFiles() {
  const sourceLocaleRoot = path.join(repoRoot, localeDir)

  if (!(await fs.pathExists(sourceLocaleRoot))) {
    return
  }

  const targetLocaleRoot = path.join(publicPDFRoot, localeDir)
  const entries = await fs.readdir(sourceLocaleRoot)

  await fs.ensureDir(targetLocaleRoot)

  for (const entry of entries) {
    const sourcePath = path.join(sourceLocaleRoot, entry)
    const stat = await fs.stat(sourcePath)

    if (stat.isFile() && /^locale\.(json|properties)$/.test(entry)) {
      await fs.copy(sourcePath, path.join(targetLocaleRoot, entry))
    }
  }

  for (const locale of entries.filter(isIncludedLocale)) {
    const sourcePath = path.join(sourceLocaleRoot, locale)
    const stat = await fs.stat(sourcePath)

    if (!stat.isDirectory()) {
      continue
    }

    const targetPath = path.join(targetLocaleRoot, locale)
    await fs.ensureDir(targetPath)
    await fs.copy(sourcePath, targetPath)
  }
}

function isIncludedLocale(name) {
  return (
    name.startsWith('en') || name.startsWith('zh') || /^(ja|ko|uk)$/.test(name)
  )
}
