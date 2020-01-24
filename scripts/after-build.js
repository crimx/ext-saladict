const fs = require('fs-extra')
const path = require('path')

main()

async function main() {
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
