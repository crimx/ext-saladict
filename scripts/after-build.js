const fs = require('fs-extra')
const path = require('path')

module.exports = class AfterBuildPlugin {
  apply(compiler) {
    compiler.hooks.done.tapAsync(
      'AfterBuildPlugin',
      (compilation, callback) => {
        firefoxFix().then(callback)
      }
    )
  }
}

async function firefoxFix() {
  await removeYoudaoFanyi()
  await removeCaiyun()
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

async function removeCaiyun() {
  // FF policy
  // caiyun trs is close-sourced
  await fs.remove(path.join(__dirname, '../build/firefox/assets/trs.js'))
}
