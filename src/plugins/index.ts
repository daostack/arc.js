import {
  ProposalPlugin,
  Plugin,
  IPluginState,
  Proposal,
  IProposalState,
  IProposalBaseCreateOptions,
  Competition,
  ContributionRewardExt,
  ContributionReward,
  ContributionRewardExtProposal,
  CompetitionProposal,
  ContributionRewardProposal,
  SchemeRegistrarProposal,
  SchemeRegistrarProposalTypes,
  GenericSchemeProposal,
  SchemeRegistrar,
  GenericScheme
} from '../index'

export const Plugins = {
  GenericScheme,
  SchemeRegistrar,
  ContributionReward,
  ContributionRewardExt,
  Competition
}

export const Proposals = {
  GenericScheme: GenericSchemeProposal,
  SchemeRegistrar: SchemeRegistrarProposal,
  ContributionReward: ContributionRewardProposal,
  Competition: CompetitionProposal,
  ContributionRewardExt: ContributionRewardExtProposal
}

export type PluginName = keyof typeof Plugins
export type ProposalName = keyof typeof Proposals

export type ProposalTypeNames = keyof typeof Proposals | SchemeRegistrarProposalTypes

export type AnyProposal = Proposal<IProposalState>
export type AnyPlugin = Plugin<IPluginState>
export type AnyProposalPlugin = ProposalPlugin<IPluginState, IProposalState, IProposalBaseCreateOptions>

export * from './plugin'
export * from './proposal'
export * from './proposalPlugin'
export * from './competition'
export * from './contributionReward'
export * from './contributionRewardExt'
export * from './genericScheme'
export * from './schemeRegistrar'
export * from './reputationFromToken'