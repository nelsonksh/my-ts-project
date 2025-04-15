import { BlockfrostProvider, builtinByteString, conStr0, list, MaestroProvider, MeshTxBuilder, stringToHex, U5CProvider } from "@meshsdk/core";
import { MeshWallet } from '@meshsdk/core';



async function buildTx() {
    // const provider = new U5CProvider({
    //     url: "https://preprod.utxorpc-v0.demeter.run:443",
    //     headers: {
    //         "dmtr-api-key": "<api-key>",
    //     },
    // });

    const maestro = new MaestroProvider({
        network: "Preprod",
        apiKey: "2jsBm5RaWPpwleGmimPSbGeDPHOG4R7d",
        turboSubmit: false
    })

    const blockfrost = new BlockfrostProvider("preprod9nU4kQP5IaqnIFP9M8DhK8bfk1W6dufu")

    const params = await blockfrost.fetchProtocolParameters()

    const wallet = new MeshWallet({
        networkId: 0, // 0: testnet, 1: mainnet
        fetcher: maestro,
        submitter: maestro,
        key: {
            type: 'mnemonic',
            words: [
                "budget",
                "fun",
                "neglect",
                "expand",
                "next",
                "rely",
                "setup",
                "matter",
                "sponsor",
                "sheriff",
                "flip",
                "melt",
                "deny",
                "bid",
                "ankle",
                "machine",
                "alley",
                "they",
                "never",
                "oppose",
                "face",
                "rely",
                "pet",
                "fatigue"
            ]
        },
    });

    const userAddress = await wallet.getChangeAddress()
    console.log("Wallet address:", userAddress)

    const txBuilder = new MeshTxBuilder({
        fetcher: maestro,
        submitter: maestro,
        evaluator: maestro,
        // params: params,
        verbose: true,
    });

    const indexAddress = "addr_test1xrrkcdgg3tyzdj9qu628erlh3kx5f9tcn0rjjsvm8ge5xpvke8x9mpjf7aerjt3n3nfd5tnzkfhlprp09mpf4sdy8dzqs6wq6p"
    const globalStateAddress = "addr_test1xr7xs02kjwr7v3frqrx4exearkd5nmx5ashhzsj5l3nja7yke8x9mpjf7aerjt3n3nfd5tnzkfhlprp09mpf4sdy8dzq6ptcdp"


    const userUtxos = await maestro.fetchAddressUTxOs(userAddress)
    console.log("userUtxos", JSON.stringify(userUtxos, null, 4))

    const policyId = "c76c35088ac826c8a0e6947c8ff78d8d4495789bc729419b3a334305"

    const tokenName = "god"
    const tokenNameHex = stringToHex(tokenName)

    const mintRedeemer = builtinByteString(tokenNameHex)
    const utxo = await maestro.fetchUTxOs("a4f8080e8e34992977fae292c0f5d843c6c78f837fa69c624e66b6aab868745e", 0)
    console.log("unit", utxo[0].output.amount[0].unit)
    console.log("utxo", utxo[0].output.amount[0].quantity)

    console.log("unit", utxo[0].output.amount[1].unit)
    console.log("utxo", utxo[0].output.amount[1].quantity)

    const tx = await txBuilder
        .txInCollateral(userUtxos[0].input.txHash, userUtxos[0].input.outputIndex)
        // withdrawal
        .withdrawalPlutusScriptV3()
        .withdrawal("stake_test17q7dwpfsxsgzdnws8kxn3afatxf4qwl3yhed44vwm5mhexgr3a09v", "0")
        .withdrawalTxInReference("8a3a9c393bec05d40b73ed459a10a5c9c7a11f197c88d1aaca48080a2e48e7c5", 1)
        .withdrawalRedeemerValue(conStr0([
            builtinByteString(tokenNameHex),
            builtinByteString("20")
        ]), "JSON")
        // existing index utxo
        .spendingPlutusScriptV3()
        .txIn(utxo[0].input.txHash, utxo[0].input.outputIndex)
        .txInInlineDatumPresent()
        .spendingTxInReference("4df3ebc0592b39124c5cc3a1cf680a5d7ac393531dd308e34ee499fbad7257e7", 7)
        .txInRedeemerValue(conStr0([]), "JSON")
        // index token
        .mintPlutusScriptV3()
        .mint("1", policyId, "20")
        .mintTxInReference("4df3ebc0592b39124c5cc3a1cf680a5d7ac393531dd308e34ee499fbad7257e7", 7)
        .mintRedeemerValue(mintRedeemer, "JSON")
        // global state
        .mintPlutusScriptV3()
        .mint("1", policyId, "313030" + tokenNameHex)
        .mintTxInReference("4df3ebc0592b39124c5cc3a1cf680a5d7ac393531dd308e34ee499fbad7257e7", 7)
        .mintRedeemerValue(mintRedeemer, "JSON")
        // user token
        .mintPlutusScriptV3()
        .mint("1", policyId, "323232" + tokenNameHex)
        .mintTxInReference("4df3ebc0592b39124c5cc3a1cf680a5d7ac393531dd308e34ee499fbad7257e7", 7)
        .mintRedeemerValue(mintRedeemer, "JSON")
        .txOut(
            "addr_test1qpuwf43fgc6wx3ed20c6wgm267t84ypxdc02qrdnjqkwgtlxakhvwf2dxzsqncufwrrau2ftmv79kh5dl9djq4jly3xspgyfcz",
            [
                {
                    unit: "lovelace",
                    quantity: "5000000",
                }
            ]
        )
        // index validator
        .txOut(
            indexAddress,
            [
                {
                    unit: utxo[0].output.amount[1].unit,
                    quantity: "1",
                }
            ]
        )
        .txOutInlineDatumValue(conStr0([
            builtinByteString("67656e65736973"),
            builtinByteString(tokenNameHex)
        ]), "JSON")
        .txOut(
            indexAddress,
            [
                {
                    unit: policyId + "20",
                    quantity: "1",
                }
            ]
        )
        .txOutInlineDatumValue(conStr0([
            builtinByteString(tokenNameHex),
            builtinByteString("67756c6c6130")
        ]), "JSON")
        // global state validator
        .txOut(
            globalStateAddress,
            [
                {
                    unit: policyId + "313030" + tokenNameHex,
                    quantity: "1",
                }
            ]
        )
        .txOutInlineDatumValue(conStr0([
            builtinByteString(policyId),
            builtinByteString(tokenNameHex),
            list([]),
            builtinByteString("20")
        ]), "JSON")
        // user address
        .txOut(
            userAddress,
            [
                {
                    unit: policyId + "323232" + tokenNameHex,
                    quantity: "1",
                }
            ]
        )
        .changeAddress(userAddress)
        .selectUtxosFrom(userUtxos)
        .complete()

    const signedTx = await wallet.signTx(tx)
    const submittedTx = await wallet.submitTx(signedTx)

    return submittedTx

}





buildTx()
    .then((submittedTx) => {
        console.log("Transaction built successfully");
        console.log("Transaction:", submittedTx);
    })
    .catch((error) => {
        console.error("Error building transaction:", error);
    });