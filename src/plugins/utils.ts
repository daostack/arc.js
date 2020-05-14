import {
  CompetitionPlugin,
  CompetitionProposal,
  ContributionRewardExtPlugin,
  ContributionRewardExtProposal,
  ContributionRewardPlugin,
  ContributionRewardProposal,
  FundingRequest,
  FundingRequestProposal,
  GenericPlugin,
  GenericPluginProposal,
  IPluginState,
  IProposalBaseCreateOptions,
  IProposalCreateOptionsComp,
  IProposalCreateOptionsCR,
  IProposalCreateOptionsCRExt,
  IProposalCreateOptionsFundingRequest,
  IProposalCreateOptionsGS,
  IProposalCreateOptionsJoinAndQuit,
  IProposalCreateOptionsPM,
  IProposalCreateOptionsSR,
  IProposalState,
  JoinAndQuit,
  JoinAndQuitProposal,
  Plugin,
  PluginManagerPlugin,
  PluginManagerProposal,
  PluginRegistrarPlugin,
  PluginRegistrarProposal,
  Proposal,
  ProposalPlugin,
  ReputationFromTokenPlugin,
  UnknownPlugin,
  UnknownProposal
} from '../index'

export const ProposalPlugins = {
  FundingRequest,
  JoinAndQuit,
  GenericScheme: GenericPlugin,
  SchemeRegistrar: PluginRegistrarPlugin,
  ContributionReward: ContributionRewardPlugin,
  ContributionRewardExt: ContributionRewardExtPlugin,
  Competition: CompetitionPlugin,
  SchemeFactory: PluginManagerPlugin,
  Unknown: UnknownPlugin
}

export const Plugins = {
  ...ProposalPlugins,
  ReputationFromToken: ReputationFromTokenPlugin,
  Unknown: UnknownPlugin
}

export type PluginName = keyof typeof Plugins

export const Proposals = {
  GenericScheme: GenericPluginProposal,
  ContributionReward: ContributionRewardProposal,
  Competition: CompetitionProposal,
  ContributionRewardExt: ContributionRewardExtProposal,
  FundingRequest: FundingRequestProposal,
  JoinAndQuit: JoinAndQuitProposal,
  SchemeRegistrar: PluginRegistrarProposal,
  SchemeRegistrarAdd: PluginRegistrarProposal,
  SchemeRegistrarRemove: PluginRegistrarProposal,
  SchemeFactory: PluginManagerProposal,
  Unknown: UnknownProposal
}

export type ProposalName = keyof typeof Proposals

export type ProposalCreateOptions =
  IProposalCreateOptionsCRExt |
  IProposalCreateOptionsGS |
  IProposalCreateOptionsSR |
  IProposalCreateOptionsComp |
  IProposalCreateOptionsCR |
  IProposalCreateOptionsFundingRequest |
  IProposalCreateOptionsJoinAndQuit |
  IProposalCreateOptionsPM

export abstract class AnyProposal extends Proposal<IProposalState> { }
export abstract class AnyPlugin extends Plugin<IPluginState> { }
export abstract class AnyProposalPlugin extends ProposalPlugin<
  IPluginState,
  IProposalState,
  IProposalBaseCreateOptions
> { }
