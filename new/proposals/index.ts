import { GenericSchemeProposal as GenericScheme } from "./genericScheme"
import { SchemeRegistrarProposal as SchemeRegistrar, SchemeRegistrarProposalTypes} from "./schemeRegistrar"

const Proposals = {
  GenericScheme,
  SchemeRegistrar
}

export type ProposalTypeNames = keyof typeof Proposals | SchemeRegistrarProposalTypes

export default Proposals