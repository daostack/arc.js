import { GenericSchemeProposal as GenericScheme } from "./genericScheme"
import { SchemeRegistrarProposal as SchemeRegistrar, SchemeRegistrarProposalTypes} from "./schemeRegistrar"
import { UGenericSchemeProposal as UGenericScheme } from "./uGenericScheme"
import { ContributionRewardProposal as ContributionReward } from "./contributionReward"
import { CompetitionProposal as Competition } from "./competition"
import { ContributionRewardExtProposal as ContributionRewardExt } from "./contributionRewardExt"


const Proposals = {
  GenericScheme,
  SchemeRegistrar,
  UGenericScheme,
  ContributionReward,
  Competition,
  ContributionRewardExt
}

export type ProposalTypeNames = keyof typeof Proposals | SchemeRegistrarProposalTypes

export default Proposals