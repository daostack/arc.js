import {
  CompetitionPlugin,
  CompetitionProposal,
  ContributionRewardPlugin,
  ContributionRewardExtPlugin,
  ContributionRewardExtProposal,
  ContributionRewardProposal,
  GenericPlugin,
  GenericPluginProposal,
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
  SchemeRegistrarPlugin,
  SchemeRegistrarProposal,
  UnknownPlugin
} from '../index'

export const ProposalPlugins = {
  GenericScheme: GenericPlugin,
  SchemeRegistrar: SchemeRegistrarPlugin,
  ContributionReward: ContributionRewardPlugin,
  ContributionRewardExt: ContributionRewardExtPlugin,
  Competition: CompetitionPlugin
}

export const Plugins = {
  ...ProposalPlugins,
  ReputationFromToken,
  unknown: UnknownPlugin
}

export type PluginName = keyof typeof Plugins

export const Proposals = {
  GenericScheme: GenericPluginProposal,
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
