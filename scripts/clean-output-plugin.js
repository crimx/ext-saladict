const fs = require('fs-extra')

module.exports = class CleanOutputPlugin {
  apply(compiler) {
    const clean = () => fs.remove(compiler.options.output.path)

    compiler.hooks.beforeRun.tapPromise('CleanOutputPlugin', clean)
    compiler.hooks.watchRun.tapPromise('CleanOutputPlugin', clean)
  }
}
