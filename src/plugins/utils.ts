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
  GenericSchemeProposal,
  SchemeRegistrar,
  GenericScheme,
  IProposalCreateOptionsCRExt,
  IProposalCreateOptionsGS,
  IProposalCreateOptionsSR,
  IProposalCreateOptionsComp,
  IProposalCreateOptionsCR
} from '../index'

export const Plugins = {
  GenericScheme,
  SchemeRegistrar,
  ContributionReward,
  ContributionRewardExt,
  Competition
}

export const ProposalPlugins = {
  ...Plugins
}

export type PluginName = keyof typeof Plugins

export const Proposals = {
  GenericScheme: GenericSchemeProposal,
  ContributionReward: ContributionRewardProposal,
  Competition: CompetitionProposal,
  ContributionRewardExt: ContributionRewardExtProposal,
  SchemeRegistrarAdd: SchemeRegistrarProposal,
  SchemeRegistrarEdit: SchemeRegistrarProposal,
  SchemeRegistrarRemove: SchemeRegistrarProposal
}

export type ProposalName = keyof typeof Proposals

export type ProposalCreateOptions =
  IProposalCreateOptionsCRExt |
  IProposalCreateOptionsGS |
  IProposalCreateOptionsSR |
  IProposalCreateOptionsComp |
  IProposalCreateOptionsCR

export type AnyProposal = Proposal<IProposalState>
export type AnyPlugin = Plugin<IPluginState>
export type AnyProposalPlugin = ProposalPlugin<IPluginState, IProposalState, IProposalBaseCreateOptions>