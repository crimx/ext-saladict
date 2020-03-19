const fs = require('fs-extra')
const path = require('path')

module.exports = class AfterBuildPlugin {
  apply(compiler) {
    compiler.hooks.done.tapAsync(
      'AfterBuildPlugin',
      (compilation, callback) => {
        removeYoudaoFanyi().then(callback)
      }
    )
  }
}

async function removeYoudaoFanyi() {
  // FF policy
  await fs.remove(
    path.join(__dirname, '../build/firefox/assets/fanyi.youdao.2.0')
  )
  // Stop FF extension check errors
  await fs.outputFile(
    path.join(__dirname, '../build/firefox/assets/fanyi.youdao.2.0/main.js'),
    ''
  )
}
