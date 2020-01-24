const fs = require('fs')
const path = require('path')
const verbose = true
const ABI_DIR = path.resolve('./src/abis')
function log(msg) {
  if (verbose) {
    console.log(msg)
  }
}
const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

/**
 * Fetch all abis from @daostack/migration into the `abis` folder.
 */
async function copyABIsFromMigration () {
  const destDir = ABI_DIR
  const sourcePath = path.resolve(`${require.resolve('@daostack/migration')}/../contracts-optimized`)
  log(`copying ABIs from ${sourcePath} to ${destDir}`)
  getDirectories(sourcePath).forEach(arcVersion => {
    if (!fs.existsSync(path.join(destDir, arcVersion))) {
        fs.mkdirSync(path.join(destDir, arcVersion), { recursive: true })
    }

    const files = fs.readdirSync(`${sourcePath}/${arcVersion}`)
    files.forEach(file => {
      const artefact = JSON.parse(fs.readFileSync(`${sourcePath}/${arcVersion}/${file}`), 'utf-8')
      const smallerArtefact = {
        constractName: artefact.contractName,
        abi: artefact.abi,
        rootVersion: artefact.rootVersion
      }
      fs.writeFileSync(
        path.join(destDir, arcVersion, file),
        JSON.stringify(smallerArtefact, undefined, 2),
        'utf-8'
      )
    })
  })
}

if (require.main === module) {
  copyABIsFromMigration().catch(err => {
    console.log(err)
    process.exit(1)
  })
} else {
  module.exports = copyABIsFromMigration
}
