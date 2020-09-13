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
  IInitParamsCompetition,
  IInitParamsCR,
  IInitParamsCRExt,
  IInitParamsFR,
  IInitParamsGS,
  IInitParamsJ,
  IInitParamsPM,
  IInitParamsRT,
  IInitParamsSR,
  IPluginState,
  IProposalBaseCreateOptions,
  IProposalCreateOptionsComp,
  IProposalCreateOptionsCR,
  IProposalCreateOptionsCRExt,
  IProposalCreateOptionsFundingRequest,
  IProposalCreateOptionsGS,
  IProposalCreateOptionsJoin,
  IProposalCreateOptionsPM,
  IProposalCreateOptionsSR,
  IProposalState,
  Join,
  JoinProposal,
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
import { IInitParamsTT, IProposalCreateOptionsTokenTrade, TokenTrade, TokenTradeProposal } from './tokenTrade'

export const ProposalPlugins = {
  FundingRequest,
  Join,
  GenericScheme: GenericPlugin,
  SchemeRegistrar: PluginRegistrarPlugin,
  ContributionReward: ContributionRewardPlugin,
  ContributionRewardExt: ContributionRewardExtPlugin,
  Competition: CompetitionPlugin,
  SchemeFactory: PluginManagerPlugin,
  TokenTrade,
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
  TokenTrade: TokenTradeProposal,
  Join: JoinProposal,
  SchemeRegistrar: PluginRegistrarProposal,
  SchemeRegistrarAdd: PluginRegistrarProposal,
  SchemeRegistrarRemove: PluginRegistrarProposal,
  SchemeFactory: PluginManagerProposal,
  Unknown: UnknownProposal
}

export interface IInitParams {
  GenericScheme: IInitParamsGS,
  ContributionReward: IInitParamsCR,
  Competition: IInitParamsCompetition,
  ContributionRewardExt: IInitParamsCRExt,
  FundingRequest: IInitParamsFR,
  TokenTrade: IInitParamsTT,
  Join: IInitParamsJ,
  SchemeRegistrar: IInitParamsSR,
  SchemeFactory: IInitParamsPM,
  ReputationFromToken: IInitParamsRT
}

export type ProposalName = keyof typeof Proposals

export type ProposalCreateOptions =
  IProposalCreateOptionsCRExt |
  IProposalCreateOptionsGS |
  IProposalCreateOptionsSR |
  IProposalCreateOptionsComp |
  IProposalCreateOptionsCR |
  IProposalCreateOptionsFundingRequest |
  IProposalCreateOptionsJoin |
  IProposalCreateOptionsTokenTrade |
  IProposalCreateOptionsPM

export abstract class AnyProposal extends Proposal<IProposalState> { }
export abstract class AnyPlugin extends Plugin<IPluginState> { }
export abstract class AnyProposalPlugin extends ProposalPlugin<
  IPluginState,
  IProposalState,
  IProposalBaseCreateOptions
> { }
