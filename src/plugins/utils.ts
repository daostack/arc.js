import {
  CompetitionPlugin,
  CompetitionProposal,
  ContributionRewardExtPlugin,
  ContributionRewardExtProposal,
  ContributionRewardPlugin,
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
  ReputationFromTokenPlugin,
  SchemeRegistrarPlugin,
  SchemeRegistrarProposal,
  UnknownPlugin,
  PluginManagerProposal,
  PluginManagerPlugin
} from '../index'

export const ProposalPlugins = {
  GenericScheme: GenericPlugin,
  SchemeRegistrar: SchemeRegistrarPlugin,
  ContributionReward: ContributionRewardPlugin,
  ContributionRewardExt: ContributionRewardExtPlugin,
  Competition: CompetitionPlugin,
  SchemeFactory: PluginManagerPlugin
}

export const Plugins = {
  ...ProposalPlugins,
  ReputationFromToken: ReputationFromTokenPlugin,
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
  SchemeRegistrarRemove: SchemeRegistrarProposal,
  SchemeFactory: PluginManagerProposal
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
