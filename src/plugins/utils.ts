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
  IProposalCreateOptionsSR,
  IProposalState,
  JoinAndQuit,
  JoinAndQuitProposal,
  Plugin,
  Proposal,
  ProposalPlugin,
  ReputationFromTokenPlugin,
  SchemeRegistrarPlugin,
  SchemeRegistrarProposal,
  UnknownPlugin
} from '../index'
import { UnknownProposal } from './unknownProposal'

export const ProposalPlugins = {
  FundingRequest,
  JoinAndQuit,
  GenericScheme: GenericPlugin,
  SchemeRegistrar: SchemeRegistrarPlugin,
  ContributionReward: ContributionRewardPlugin,
  ContributionRewardExt: ContributionRewardExtPlugin,
  Competition: CompetitionPlugin,
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
  SchemeRegistrar: SchemeRegistrarProposal,
  SchemeRegistrarAdd: SchemeRegistrarProposal,
  SchemeRegistrarEdit: SchemeRegistrarProposal,
  SchemeRegistrarRemove: SchemeRegistrarProposal,
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
  IProposalCreateOptionsJoinAndQuit

export type AnyProposal = Proposal<IProposalState>
export type AnyPlugin = Plugin<IPluginState>
export type AnyProposalPlugin = ProposalPlugin<
  IPluginState,
  IProposalState,
  IProposalBaseCreateOptions
>
