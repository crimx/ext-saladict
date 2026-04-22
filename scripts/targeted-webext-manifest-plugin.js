const fse = require('fs-extra')
const path = require('path')
const merge = require('deepmerge')

const {
  manifestDir,
  loadCommonManifest,
  loadManifest
} = require('./webext-targets')

class TargetedWebextManifestPlugin {
  constructor(options, neutrinoOpts) {
    this.options = {
      browsers: [],
      manifest: manifestDir,
      output: path.join(neutrinoOpts.root, 'build'),
      polyfill: false,
      removePolyfillSourcemap: true,
      ...options
    }
    this.neutrinoOpts = neutrinoOpts
  }

  apply(compiler) {
    compiler.hooks.done.tapPromise(
      'TargetedWebextManifestPlugin',
      async ({ compilation }) => {
        if (!this.options.browsers.length) {
          await fse.remove(this.neutrinoOpts.output)
          return
        }

        const neutrinoManifest = createNeutrinoManifest(
          compilation,
          this.neutrinoOpts,
          this.options
        )
        const commonManifest = loadCommonManifest()
        const sourceOutput = this.neutrinoOpts.output

        for (let i = 0; i < this.options.browsers.length; i++) {
          const browser = this.options.browsers[i]
          const browserManifest =
            loadManifest(path.join(this.options.manifest, `${browser}.manifest`)) ||
            {}
          const output = path.join(this.options.output, browser)
          const finalManifest = merge.all([
            neutrinoManifest,
            commonManifest,
            browserManifest
          ])

          await fse.remove(output)

          if (i !== this.options.browsers.length - 1) {
            await fse.copy(sourceOutput, output)
          } else {
            await fse.move(sourceOutput, output)
          }

          if (finalManifest.manifest_version === 3) {
            const backgroundScripts =
              (finalManifest.background && finalManifest.background.scripts) || []

            patchChromiumMv3Manifest(finalManifest)

            await fse.writeFile(
              path.join(output, 'background-sw.js'),
              createBackgroundServiceWorkerBootstrap(backgroundScripts)
            )
          }

          await fse.outputJSON(path.join(output, 'manifest.json'), finalManifest, {
            spaces: '  '
          })

          if (this.options.polyfill) {
            await copyPolyfill(this.options, output)
          }
        }
      }
    )
  }
}

module.exports = TargetedWebextManifestPlugin

function createNeutrinoManifest(compilation, neutrinoOpts, pluginOptions) {
  const neutrinoManifest = {
    version: neutrinoOpts.packageJson.version
  }

  compilation.entrypoints.forEach((entry, name) => {
    const htmlPluginOpts = neutrinoOpts.mains[name]
    const entryOpts = htmlPluginOpts && htmlPluginOpts.webext
    if (!entryOpts) {
      return
    }

    switch (entryOpts.type) {
      case 'content_scripts': {
        if (!neutrinoManifest.content_scripts) {
          neutrinoManifest.content_scripts = []
        }

        const files = entry
          .getFiles()
          .map(file => file.replace(/\.(css|js)\?.*$/, '.$1'))
        const js = files.filter(file => file.endsWith('.js'))
        const css = files.filter(file => file.endsWith('.css'))
        const manifest = {
          ...(entryOpts.manifest || {})
        }

        if (pluginOptions.polyfill) {
          js.unshift('assets/browser-polyfill.min.js')
        }
        if (js.length > 0) {
          manifest.js = manifest.js ? [...js, ...manifest.js] : js
        }
        if (css.length > 0) {
          manifest.css = manifest.css ? [...css, ...manifest.css] : css
        }
        neutrinoManifest.content_scripts.push(manifest)
        break
      }
      case 'background': {
        const scripts = entry
          .getFiles()
          .map(file => file.replace(/\.js\?.*$/, '.$1'))
          .filter(file => file.endsWith('.js'))

        if (pluginOptions.polyfill) {
          scripts.unshift('assets/browser-polyfill.min.js')
        }

        neutrinoManifest[entryOpts.type] = {
          scripts,
          ...(entryOpts.manifest || {})
        }
        break
      }
      case 'browser_action':
      case 'page_action':
        neutrinoManifest[entryOpts.type] = {
          default_popup: htmlPluginOpts.filename || `${name}.html`,
          ...(entryOpts.manifest || {})
        }
        break
      case 'options_page':
        neutrinoManifest[entryOpts.type] =
          htmlPluginOpts.filename || `${name}.html`
        break
      case 'options_ui':
        neutrinoManifest[entryOpts.type] = {
          page: htmlPluginOpts.filename || `${name}.html`,
          ...(entryOpts.manifest || {})
        }
        break
      default:
        break
    }
  })

  return neutrinoManifest
}

async function copyPolyfill(options, output) {
  const polyfill = await fse.readFile(options.polyfill, 'utf8')
  if (!polyfill) {
    return
  }

  await fse.outputFile(
    path.join(output, 'assets/browser-polyfill.min.js'),
    options.removePolyfillSourcemap
      ? polyfill.replace(
          '//# sourceMappingURL=browser-polyfill.min.js.map',
          ''
        )
      : polyfill
  )
}

function patchChromiumMv3Manifest(manifest) {
  const permissions = new Set(manifest.permissions || [])
  const optionalPermissions = new Set(manifest.optional_permissions || [])
  const hostPermissions = new Set(manifest.host_permissions || [])

  ;[...permissions].forEach(permission => {
    if (permission === '<all_urls>' || permission.includes('://')) {
      hostPermissions.add(permission)
      permissions.delete(permission)
    }
  })

  permissions.delete('webRequestBlocking')
  permissions.add('scripting')
  permissions.add('offscreen')
  permissions.add('declarativeNetRequestWithHostAccess')

  optionalPermissions.delete('background')

  manifest.minimum_chrome_version = '128'
  manifest.permissions = [...permissions]
  manifest.optional_permissions = [...optionalPermissions]
  manifest.host_permissions = [...hostPermissions]

  if (manifest.browser_action) {
    manifest.action = manifest.action || manifest.browser_action
    delete manifest.browser_action
  }

  manifest.background = {
    service_worker: 'background-sw.js'
  }

  if (manifest.options_ui) {
    delete manifest.options_ui.chrome_style
  }

  delete manifest.content_security_policy

  if (Array.isArray(manifest.web_accessible_resources)) {
    manifest.web_accessible_resources = [
      {
        resources: manifest.web_accessible_resources,
        matches: ['<all_urls>']
      }
    ]
  }
}

function createBackgroundServiceWorkerBootstrap(backgroundScripts) {
  return [
    'self.window = self;',
    'self.global = self;',
    backgroundScripts.length > 0
      ? `importScripts(${backgroundScripts.map(JSON.stringify).join(', ')});`
      : ''
  ]
    .filter(Boolean)
    .join('\n')
}
