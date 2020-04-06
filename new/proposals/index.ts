import { GenericSchemeProposal as GenericScheme } from "./genericScheme"
import { SchemeRegistrarProposal as SchemeRegistrar, SchemeRegistrarProposalTypes} from "./schemeRegistrar"
import { UGenericSchemeProposal as UGenericScheme } from "./uGenericScheme"
import { ContributionRewardProposal as ContributionReward } from "./contributionReward"

const Proposals = {
  GenericScheme,
  SchemeRegistrar,
  UGenericScheme,
  ContributionReward
}

export type ProposalTypeNames = keyof typeof Proposals | SchemeRegistrarProposalTypes

export default Proposals