import * as dotenv from 'dotenv';
import { MaestroClient, Configuration } from "@maestro-org/typescript-sdk";

// Load environment variables from .env file
dotenv.config();

async function main() {

    let maestroClient = new MaestroClient(
        new Configuration({
            apiKey: process.env.MAESTRO_API_KEY,
            network: "Preprod",
        })
    );

    const address = "addr_test1qzx4yysnpp9t2692g08gdmvykl22w4fyfqyp2clzrqrx5tdk88srfmghu2rk9nh87744pdaew9x9tz80mqz0pszlhvrs6zlvrg";
    const tx_hash = "dc5c0725755f4525c8effc87751a1cb21ffc25f9bbf363a7c57283290b621581"

    maestroClient
        // .addresses
        // .txsByAddress(
        //     address
        // )
        .transactions
        .txInfo(tx_hash)
        .then((x) => console.log(x.data))
        .catch((error) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
            }
        })
}

main();