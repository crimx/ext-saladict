const fs = require('fs-extra')
const path = require('path')

main().catch(swallow)

// set-up local testing env
async function main() {
  fs.ensureDir(path.join(__dirname, '../build'))
  const depsPath = path.join(__dirname, '../deps')
  const destPath = path.join(__dirname, '../node_modules')
  if (await isDirectory(depsPath)) {
    const depsFiles = []
    const rawDepsFiles = await fs.readdir(depsPath)
    for (const name of rawDepsFiles) {
      if (name.startsWith('@')) {
        const nsFiles = await fs.readdir(path.join(depsPath, name))
        for (const nsName of nsFiles) {
          depsFiles.push(path.join(name, nsName))
        }
      } else {
        depsFiles.push(name)
      }
    }
    await Promise.all(
      depsFiles.map(async name => {
        const destPkgPath = path.join(destPath, name)
        await fs.remove(destPkgPath).catch(swallow)
        await fs.ensureDir(destPkgPath).catch(swallow)
        await fs.copy(path.join(depsPath, name), destPkgPath).catch(swallow)
      })
    )
  }
}

async function isDirectory(dirPath) {
  const dirStat = await fs.stat(dirPath).catch(swallow)
  return Boolean(dirStat && dirStat.isDirectory())
}

function swallow() {
  return null
}
