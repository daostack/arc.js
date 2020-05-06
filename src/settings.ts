// the version of the redeemer contract to use.
// we can specify multiple versions, and try to find them in the order given
export const LATEST_ARC_VERSION = '0.1.1-rc.16'
//
export const REDEEMER_CONTRACT_VERSIONS = [
  LATEST_ARC_VERSION
]
// used for a workaround
export const CONTRIBUTION_REWARD_DUMMY_VERSION = LATEST_ARC_VERSION
// export const ABI_DIR = path.resolve('./node_modules/@daostack/migration/contracts-optimized')
export const ABI_DIR = './abis'
