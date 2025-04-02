import blueprint from "./plutus.json"


import { ConStr0, PubKeyAddress, ScriptAddress, Pairs, PolicyId, AssetName, Integer, ConStr1, ConStr2, SpendingBlueprint } from "@meshsdk/core"





const version = "V3"
const networkId = 0; // 0 for testnet; 1 for mainnet
// Every spending validator would compile into an address with an staking key hash
// Recommend replace with your own stake key / script hash
const stakeKeyHash = ""
const isStakeScriptCredential = false

export class EscrowSpendBlueprint extends SpendingBlueprint {
  compiledCode: string

  constructor() {
    const compiledCode = blueprint.validators[0]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode
    this.noParamScript(compiledCode)
  }

   datum = (data: EscrowDatum): EscrowDatum => data
   redeemer = (data: EscrowRedeemer): EscrowRedeemer => data
}







export type EscrowRedeemer = RecipientDeposit | CancelTrade | CompleteTrade;

export type RecipientDeposit = ConStr0<[PubKeyAddress | ScriptAddress, Pairs<PolicyId, Pairs<AssetName, Integer>>]>;

export type MValue = Pairs<PolicyId, Pairs<AssetName, Integer>>;

export type CancelTrade = ConStr1<[]>;

export type CompleteTrade = ConStr2<[]>;

export type EscrowDatum = Initiation | ActiveEscrow;

export type Initiation = ConStr0<[PubKeyAddress | ScriptAddress, Pairs<PolicyId, Pairs<AssetName, Integer>>]>;

export type ActiveEscrow = ConStr1<[PubKeyAddress | ScriptAddress, Pairs<PolicyId, Pairs<AssetName, Integer>>, PubKeyAddress | ScriptAddress, Pairs<PolicyId, Pairs<AssetName, Integer>>]>;


