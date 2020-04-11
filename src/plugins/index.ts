import { GenericScheme } from "./genericScheme/plugin"
import { SchemeRegistrar } from "./schemeRegistrar/plugin"
import { UGenericScheme } from "./uGenericScheme/plugin"
import { GenericSchemeProposal } from "./genericScheme/proposal"
import { SchemeRegistrarProposal, SchemeRegistrarProposalTypes} from "./schemeRegistrar/proposal"
import { UGenericSchemeProposal } from "./uGenericScheme/proposal"
import { ContributionRewardProposal } from "./contributionReward/proposal"
import { CompetitionProposal } from "./competition/proposal"
import { ContributionRewardExtProposal } from "./contributionRewardExt/proposal"
import { ContributionReward } from './contributionReward/plugin'
import { ContributionRewardExt } from "./contributionRewardExt/plugin"
import { Competition } from "./competition/plugin"

export const Plugins = {
  GenericScheme,
  SchemeRegistrar,
  UGenericScheme,
  ContributionReward,
  ContributionRewardExt,
  Competition
}

export const Proposals = {
  GenericScheme: GenericSchemeProposal,
  SchemeRegistrar: SchemeRegistrarProposal,
  UGenericScheme: UGenericSchemeProposal,
  ContributionReward: ContributionRewardProposal,
  Competition: CompetitionProposal,
  ContributionRewardExt: ContributionRewardExtProposal
}

export type PluginName = keyof typeof Plugins
export type ProposalName = keyof typeof Proposals

export type ProposalTypeNames = keyof typeof Proposals | SchemeRegistrarProposalTypes