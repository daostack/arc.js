[@daostack/client - v0.2.64](../README.md) › [Globals](../globals.md) › [IStateful](istateful.md)

# Interface: IStateful <**T**>

## Type parameters

▪ **T**

## Hierarchy

* **IStateful**

## Implemented by

* [CompetitionScheme](../classes/competitionscheme.md)
* [CompetitionSuggestion](../classes/competitionsuggestion.md)
* [CompetitionVote](../classes/competitionvote.md)
* [DAO](../classes/dao.md)
* [Event](../classes/event.md)
* [Member](../classes/member.md)
* [Proposal](../classes/proposal.md)
* [Queue](../classes/queue.md)
* [Reputation](../classes/reputation.md)
* [Reward](../classes/reward.md)
* [Scheme](../classes/scheme.md)
* [SchemeBase](../classes/schemebase.md)
* [Stake](../classes/stake.md)
* [Tag](../classes/tag.md)
* [Token](../classes/token.md)
* [Vote](../classes/vote.md)

## Index

### Properties

* [state](istateful.md#state)

## Properties

###  state

• **state**: *function*

*Defined in [src/types.ts:12](https://github.com/dorgtech/client/blob/74940d1/src/types.ts#L12)*

#### Type declaration:

▸ (`apolloQueryOptions`: [IApolloQueryOptions](iapolloqueryoptions.md)): *Observable‹T›*

**Parameters:**

Name | Type |
------ | ------ |
`apolloQueryOptions` | [IApolloQueryOptions](iapolloqueryoptions.md) |
