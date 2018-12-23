/**!
 * Upgrade PDF.js
 */

const shell = require('shelljs')
const path = require('path')
const fs = require('fs-extra')

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git')
  shell.exit(1)
}

const repoRoot = 'pdf'
const publicPDFRoot = path.join(__dirname, '../public/static/pdf')
const pdfFiles = [
  'build/pdf.js',
  'build/pdf.worker.js',
  'web/debugger.js',
  'web/viewer.js',
  'web/viewer.html',
  'web/viewer.css',
]
const pdfDirs = [
  'web/cmaps',
  'web/images',
  'web/locale',
]
const files = [...pdfFiles, ...pdfDirs]

shell.cd(path.resolve(__dirname))

shell.rm('-rf', repoRoot)

exec( // single brach cloning turns out much slower
  `git clone https://github.com/mozilla/pdf.js.git ${repoRoot} --progress --verbose`,
  'Error: Git clone failed',
)

shell.cd('./' + repoRoot)

exec('git checkout gh-pages')

startUpgrade()

async function startUpgrade () {
  shell.echo('\nChecking files.')
  await Promise.all(files.map(p => exists(path.join(__dirname, repoRoot, p))))

  shell.echo('\nModifying files.')
  await Promise.all([modifyViewrJS(), modifyViewerHTML()])

  shell.echo('\nCloning files.')
  removeDirs()
  cloneFiles('build')
  cloneFiles('web')

  shell.echo('\nCleaning files.')
  shell.cd(path.resolve(__dirname))
  shell.rm('-rf', repoRoot)

  shell.echo('\ndone.')
}

async function modifyViewrJS () {
  const viewerPath = path.join(__dirname, repoRoot,'web/viewer.js')
  let file = await fs.readFile(viewerPath, 'utf8')

  file = '/* saladict */ window.__SALADICT_PDF_PAGE__ = true;\n' + file

  // change default pdf
  const defaultPDFTester = /defaultUrl: {[\s\S]*?value: ('\S+?.pdf'),[\s\S]*?kind: OptionKind.VIEWER/
  if (!defaultPDFTester.test(file)) {
    shell.echo('Could not locate default pdf in viewer.js')
    shell.exit(1)
  }
  file = file.replace(defaultPDFTester, (m, p1) => m.replace(p1, "/* saladict */'/static/pdf/default.pdf'"))

  // disable url check
  const validateTester = /var validateFileURL[^\n]*\n+^{$[\s\S]+?^}$/m
  if (!validateTester.test(file)) {
    shell.echo('Could not locate validateFileURL in viewer.js')
    shell.exit(1)
  }
  file = file.replace(validateTester, '/* saladict */var validateFileURL = () => {};')

  await fs.writeFile(viewerPath, file)
}

async function modifyViewerHTML () {
  const viewerPath = path.join(__dirname, repoRoot,'web/viewer.html')
  let file = await fs.readFile(viewerPath, 'utf8')

  if (!file.includes(`</body>`)) {
    shell.echo('Could not locate </body> in viewer.js')
    shell.exit(1)
  }

  file = file.replace(`</body>`,
`
    <!-- Saladict -->
    <link rel="stylesheet" href="/content.css">
    <script src="/static/browser-polyfill.min.js"></script>
    <script src="/selection.js"></script>
    <script src="/content.js"></script>
  </body>
`
  )

  await fs.writeFile(viewerPath, file)
}

function removeDirs () {
  pdfDirs.forEach(name => {
    shell.rm('-rf', path.join(publicPDFRoot, name))
  })
}

function cloneFiles (subdir) {
  const execResult = shell.cp(
    '-R',
    files
      .filter(name => name.startsWith(subdir))
      .map(name => path.join(__dirname, repoRoot, name)),
    path.join(publicPDFRoot, subdir),
  )

  if (execResult.code !== 0) {
    shell.echo(execResult.stdout)
    shell.echo(execResult.stderr)
    shell.exit(1)
  }
}

async function exists (path) {
  try {
    await fs.access(path)
  } catch (e) {
    shell.echo(path + ' not exist')
    shell.exit(1)
  }
}

function exec (command, errorMsg) {
  const execResult = shell.exec(command)

  if (execResult.code !== 0) {
    if (errorMsg) { shell.echo(errorMsg) }
    shell.echo(execResult.stdout)
    shell.echo(execResult.stderr)
    shell.exit(1)
  }
}
