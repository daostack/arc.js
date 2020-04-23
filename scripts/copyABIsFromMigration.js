const fs = require("fs")
const path = require('path')
const verbose = true
const ABI_DIR = path.resolve('./src/abis')
const optimizer = require("@daostack/migration-experimental/optimize-abis")

async function optimizeABIs () {
  optimizer.initDirectory()
  await optimizer.noBytecode()
  await optimizer.noWhitespace()
  await optimizer.noDuplicates()
}

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
 * Fetch all abis from @daostack/migration-experimental into the `abis` folder.
 */
async function copyABIs() {
  const destDir = ABI_DIR
  const sourcePath = path.resolve(`${require.resolve('@daostack/migration-experimental')}/../contracts-optimized`)
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

async function run () {
  await optimizeABIs()
  await copyABIs()
}

if (require.main === module) {
  run().catch(err => {
    console.log(err)
    process.exit(1)
  })
} else {
  module.exports = optimizeABIs
}
