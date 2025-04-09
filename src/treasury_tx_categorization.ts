import { BuiltinByteString, ConStr0, Integer, MeshValue, value } from '@meshsdk/core';
import { parseDatumCbor } from '@meshsdk/core-cst';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {

    const address_hex_mainnet = "3187d860cb31ccd911539d99c52a31d3b568cc0f37c68f48dd01dfc85498be90f93cd9a2bcada890943453a67b6fc615d410ccd1a705f51683"
    let pageNo = 1;
    let maxPageNo = 1;
    let txs: any[] = [];
    if (pageNo === 1) {
        const data = await fetchTxsByAddress(address_hex_mainnet, pageNo);
        const limit = data.limit;
        const count = data.count;
        maxPageNo = Math.ceil(count / limit);
        txs = txs.concat(...data.transactions);
        pageNo++;
    }

    for (; pageNo <= maxPageNo; pageNo++) {
        const data = await fetchTxsByAddress(address_hex_mainnet, pageNo);
        txs = txs.concat(...data.transactions);
    }
    // console.log(txs)
    console.log("Total transactions: ", txs.length);
    const tagged_txs = txs.flatMap((tx: any) => {
        const tags: ("fund_tx" | "publish_project_tx" | "commit_project_tx" | "cannot_be_determined")[] = [];
        if (isDepositFund(tx, address_hex_mainnet)) {
            tags.push("fund_tx");
        }
        if (isPublishProjectTx(tx, address_hex_mainnet)) {
            tags.push("publish_project_tx");
        }
        if (isCommitTx(tx, address_hex_mainnet)) {
            tags.push("commit_project_tx");
        }
        if (tags.length === 0) {
            tags.push("cannot_be_determined");
        }
        return {
            hash: tx.hash,
            tags: tags
        }
    })

    console.log("Tagged transactions: ", tagged_txs);

}

async function fetchTxsByAddress(address_hex_mainnet: string, pageNo: number): Promise<any> {

    const apiKey = process.env.CARDANOSCAN_API_KEY;

    try {
        const response = await fetch(`https://api.cardanoscan.io/api/v1/transaction/list?address=${address_hex_mainnet}&pageNo=${pageNo}`, {
            method: 'GET',
            headers: {
                apiKey: apiKey || '',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData);
            console.log(response.status);
            console.log(response.headers);
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // console.log(data);
        return data;

    } catch (error: any) {
        console.log("Error", error.message);
        throw error;
    }
}

function isDepositFund(tx: any, address: string): boolean {
    // no outgoing utxo from treasury
    const outgoing_is_absent = !tx.inputs.some((output: any) => {
        return output.address === address;
    });
    // incoming utxo to treasury without datum
    const incoming_is_present_and_has_no_datum = tx.outputs.some((output: any) => {
        const address_match = output.address === address;
        const has_no_datum = output.datum === null || output.datum === undefined;
        return address_match && has_no_datum;
    });

    return outgoing_is_absent && incoming_is_present_and_has_no_datum;
}

function isPublishProjectTx(tx: any, address: string): boolean {
    // no outgoing utxo from treasury OR outgoing utxo from treasury with datum has fewer projects
    const outgoing_is_absent = !tx.inputs.some((output: any) => {
        return output.address === address;
    });

    let number_of_projects_in_outgoing = 0;
    tx.inputs.filter((input: any) => {
        const address_match = input.address === address;
        const has_datum = input.datum !== null && input.datum !== undefined;
        return address_match && has_datum;
    }).map((input: any) => {
        const datum = parseDatumCbor(input.datum.value);
        const project_list = datum.fields[0].list as ConStr0<[BuiltinByteString, Integer]>[];
        project_list.forEach(_ => {
            number_of_projects_in_outgoing += 1;
        });
    })

    // incoming utxo to treasury with datum with more projects
    const incoming_is_present_and_has_datum = tx.outputs.some((output: any) => {
        const address_match = output.address === address;
        const has_datum = output.datum !== null && output.datum !== undefined;
        return address_match && has_datum;
    });

    let number_of_projects_in_incoming = 0;
    tx.outputs.filter((output: any) => {
        const address_match = output.address === address;
        const has_datum = output.datum !== null && output.datum !== undefined;
        return address_match && has_datum;
    }).map((output: any) => {
        const datum = parseDatumCbor(output.datum.value);
        const project_list = datum.fields[0].list as ConStr0<[BuiltinByteString, Integer]>[];
        project_list.forEach(_ => {
            number_of_projects_in_incoming += 1;
        });
    })

    return incoming_is_present_and_has_datum && (outgoing_is_absent || number_of_projects_in_incoming > number_of_projects_in_outgoing);
}

function isCommitTx(tx: any, address: string): boolean {
    // no outgoing utxo from treasury OR outgoing utxo from treasury with datum has more projects
    const outgoing_is_present = tx.inputs.some((output: any) => {
        return output.address === address;
    });

    
    let number_of_projects_in_outgoing = 0;
    tx.inputs.filter((input: any) => {
        const address_match = input.address === address;
        const has_datum = input.datum !== null && input.datum !== undefined;
        return address_match && has_datum;
    }).map((input: any) => {
        const datum = parseDatumCbor(input.datum.value);
        const project_list = datum.fields[0].list as ConStr0<[BuiltinByteString, Integer]>[];
        project_list.forEach(_ => {
            number_of_projects_in_outgoing += 1;
        });
    })

    // incoming utxo to treasury with datum with lesser (or same in case of projects with multi commitments) projects
    const incoming_is_present_and_has_datum = tx.outputs.some((output: any) => {
        const address_match = output.address === address;
        const has_datum = output.datum !== null && output.datum !== undefined;
        return address_match && has_datum;
    });

    let number_of_projects_in_incoming = 0;
    tx.outputs.filter((output: any) => {
        const address_match = output.address === address;
        const has_datum = output.datum !== null && output.datum !== undefined;
        return address_match && has_datum;
    }).map((output: any) => {
        const datum = parseDatumCbor(output.datum.value);
        const project_list = datum.fields[0].list as ConStr0<[BuiltinByteString, Integer]>[];
        project_list.forEach(_ => {
            number_of_projects_in_incoming += 1;
        });
    })

    return incoming_is_present_and_has_datum && (outgoing_is_present && number_of_projects_in_incoming <= number_of_projects_in_outgoing);
}

function datum() {
    const datum = "d8799f9fd8799f5820ce475d2f1d2a12e1529f7dc2dd400a42737d29c9f058199d6ce4f76e45a2a10201ffd8799f5820bfa8f7c51a1edec1626ec826b9458e504b9d621eb43a5ed10a6b82f5216091d501ffff9f581c3d27cce2511b0baa20a45b6ff961c80268eca02e5e38cecb3ddd89c7ffff"
    const json_value = parseDatumCbor(datum);
    console.log(typeof(json_value));
}




main();
// datum();