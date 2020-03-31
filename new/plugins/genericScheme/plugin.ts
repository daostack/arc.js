import { Address } from "../../types";
import { IProposalBaseCreateOptions } from "../../proposal/proposal";
import { ProposalPlugin } from "../proposalPlugin";

interface IGenericSchemeInfo {
  id: string
  contractToCall: Address
  votingMachine: Address
}

interface IGenericScheme {
  id: string
  contractToCall: Address
  callData: string
  executed: boolean
  returnValue: string
}


interface IProposalCreateOptionsGS extends IProposalBaseCreateOptions {
  callData?: string
  value?: number
}

class GenericScheme extends ProposalPlugin<GenericScheme> {
  
}