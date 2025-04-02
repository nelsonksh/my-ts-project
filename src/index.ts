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
    // console.log("Total transactions: ", txs.length);
    const a = txs.filter((tx) => {
        return isDepositFund(tx, address_hex_mainnet);
    })
    console.log(a.length);
    const b = txs.filter((tx) => {
        return isCommitTx(tx, address_hex_mainnet);
    })
    console.log(b.length);
    b[0].inputs.filter((input: any) => {
        if (!(input.datum === null || input.datum === undefined)) {
        console.log(input.datum);
        }
    })
    const c = txs.filter((tx) => {
        return isPublishProjectTx(tx, address_hex_mainnet);
    }
    )
    console.log(c.length);
}

main();

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
    const input_is_present_and_has_no_datum = tx.inputs.some((input: any) => {
        const address_match = input.address === address;
        const has_no_datum = input.datum === null || input.datum === undefined;
        return address_match && has_no_datum;
    });
    const output_is_absent = !tx.outputs.every((output: any) => {
        return output.address !== address;
    });
    return input_is_present_and_has_no_datum && output_is_absent;
}

function isCommitTx(tx: any, address: string): boolean {
    const input_is_present_and_has_datum = tx.inputs.some((input: any) => {
        const address_match = input.address === address;
        const has_datum = input.datum !== null && input.datum !== undefined;
        return address_match && has_datum;
    });
    const output_is_absent = !tx.outputs.every((output: any) => {
        return output.address !== address;
    });
    return input_is_present_and_has_datum && output_is_absent;
}

function isPublishProjectTx(tx: any, address: string): boolean {
    const input_is_present_and_has_datum = tx.inputs.some((input: any) => {
        const address_match = input.address === address;
        const has_datum = input.datum !== null && input.datum !== undefined;
        return address_match && has_datum;
    });
    const output_is_present = tx.outputs.some((output: any) => {
        return output.address === address;
    });
    return input_is_present_and_has_datum && output_is_present;
}