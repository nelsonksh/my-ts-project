import { builtinByteString, conStr0, list, MaestroProvider, MeshTxBuilder, stringToHex, U5CProvider } from "@meshsdk/core";

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

    const txBuilder = new MeshTxBuilder({
        fetcher: maestro,
        submitter: maestro,
        evaluator: maestro,
        verbose: true,
    });

    const indexAddress = "addr_test1xrrkcdgg3tyzdj9qu628erlh3kx5f9tcn0rjjsvm8ge5xpvke8x9mpjf7aerjt3n3nfd5tnzkfhlprp09mpf4sdy8dzqs6wq6p"
    const globalStateAddress = "addr_test1xr7xs02kjwr7v3frqrx4exearkd5nmx5ashhzsj5l3nja7yke8x9mpjf7aerjt3n3nfd5tnzkfhlprp09mpf4sdy8dzq6ptcdp"

    const userAddress = "addr_test1qzx4yysnpp9t2692g08gdmvykl22w4fyfqyp2clzrqrx5tdk88srfmghu2rk9nh87744pdaew9x9tz80mqz0pszlhvrs6zlvrg"

    const userUtxos = await maestro.fetchAddressUTxOs(userAddress)

    const policyId = "c76c35088ac826c8a0e6947c8ff78d8d4495789bc729419b3a334305"

    const tokenName = "god"
    const tokenNameHex = stringToHex(tokenName)

    const mintRedeemer = builtinByteString(tokenNameHex)

    const tx = await txBuilder
        .txInCollateral(userUtxos[0].input.txHash, userUtxos[0].input.outputIndex)
        // existing index utxo
        .spendingPlutusScriptV3()
        .txIn("a4f8080e8e34992977fae292c0f5d843c6c78f837fa69c624e66b6aab868745e", 0)
        .txInInlineDatumPresent()
        .spendingTxInReference("4df3ebc0592b39124c5cc3a1cf680a5d7ac393531dd308e34ee499fbad7257e7", 7)
        .txInRedeemerValue(conStr0([]), "JSON")
        // index token
        .mintPlutusScriptV3()
        .mint("1", policyId, "20")
        .mintTxInReference("8a3a9c393bec05d40b73ed459a10a5c9c7a11f197c88d1aaca48080a2e48e7c5", 1)
        .mintRedeemerValue(mintRedeemer, "JSON")
        // global state
        .mintPlutusScriptV3()
        .mint("1", policyId, "313030"+tokenNameHex)
        .mintTxInReference("8a3a9c393bec05d40b73ed459a10a5c9c7a11f197c88d1aaca48080a2e48e7c5", 1)
        .mintRedeemerValue(mintRedeemer, "JSON")
        // user token
        .mintPlutusScriptV3()
        .mint("1", policyId, "323232"+tokenNameHex)
        .mintTxInReference("8a3a9c393bec05d40b73ed459a10a5c9c7a11f197c88d1aaca48080a2e48e7c5", 1)
        .mintRedeemerValue(mintRedeemer, "JSON")
        // index validator
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
                    unit: policyId + "313030"+tokenNameHex,
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
                    unit: policyId + "323232"+tokenNameHex,
                    quantity: "1",
                }
            ]
        )
        .changeAddress(userAddress)
        .selectUtxosFrom(userUtxos)
        .complete()

    return tx

}





buildTx()
    .then((tx) => {
        console.log("Transaction built successfully");
        console.log("Transaction:", tx);
    })
    .catch((error) => {
        console.error("Error building transaction:", error);
    });