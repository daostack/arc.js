import {
  Competition,
  CompetitionProposal,
  ContributionReward,
  ContributionRewardExt,
  ContributionRewardExtProposal,
  ContributionRewardProposal,
  GenericScheme,
  GenericSchemeProposal,
  IPluginState,
  IProposalBaseCreateOptions,
  IProposalCreateOptionsComp,
  IProposalCreateOptionsCR,
  IProposalCreateOptionsCRExt,
  IProposalCreateOptionsGS,
  IProposalCreateOptionsSR,
  IProposalState,
  Plugin,
  Proposal,
  ProposalPlugin,
  ReputationFromToken,
  SchemeRegistrar,
  SchemeRegistrarProposal,
  UnknownPlugin
} from '../index'

export const ProposalPlugins = {
  GenericScheme,
  SchemeRegistrar,
  ContributionReward,
  ContributionRewardExt,
  Competition
}

export const Plugins = {
  ...ProposalPlugins,
  ReputationFromToken,
  unknown: UnknownPlugin
}

export type PluginName = keyof typeof Plugins

export const Proposals = {
  GenericScheme: GenericSchemeProposal,
  ContributionReward: ContributionRewardProposal,
  Competition: CompetitionProposal,
  ContributionRewardExt: ContributionRewardExtProposal,
  SchemeRegistrar: SchemeRegistrarProposal,
  SchemeRegistrarAdd: SchemeRegistrarProposal,
  SchemeRegistrarEdit: SchemeRegistrarProposal,
  SchemeRegistrarRemove: SchemeRegistrarProposal
}

export type ProposalName = keyof typeof Proposals

export type ProposalCreateOptions =
  | IProposalCreateOptionsCRExt
  | IProposalCreateOptionsGS
  | IProposalCreateOptionsSR
  | IProposalCreateOptionsComp
  | IProposalCreateOptionsCR

export type AnyProposal = Proposal<IProposalState>
export type AnyPlugin = Plugin<IPluginState>
export type AnyProposalPlugin = ProposalPlugin<
  IPluginState,
  IProposalState,
  IProposalBaseCreateOptions
>
