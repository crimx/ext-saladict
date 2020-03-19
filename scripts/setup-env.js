const fs = require('fs-extra')
const path = require('path')

main().catch(swallow)

async function main() {
  const depsPath = path.join(__dirname, '../deps')
  const destPath = path.join(__dirname, '../node_modules')
  const stat = await fs.stat(depsPath).catch(swallow)
  if (stat && stat.isDirectory()) {
    const depsFiles = await fs.readdir(depsPath)
    await Promise.all(
      depsFiles.map(name => fs.remove(path.join(destPath, name)).catch(swallow))
    )
    fs.copy(path.join(depsPath), destPath).catch(swallow)
  }
}

function swallow() {
  return null
}
