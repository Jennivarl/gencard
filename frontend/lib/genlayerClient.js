// GenLayer Client for Contract Verification
// Contract deployed at: 0x250d18985aEd716A9d98c84dbcDf9353FcacacBa (with GenLayer-themed nicknames)

import { createClient, createAccount, abi } from 'genlayer-js';
import { localnet } from 'genlayer-js/chains';
import rlp from 'rlp';

export async function verifyWithGenLayer(name, role) {
    const RPC = process.env.GENLAYER_RPC_URL;
    const CONTRACT = process.env.GENLAYER_CONTRACT_ADDRESS;
    const PRIVATE_KEY = '0xc8dccd4e1dbe0c1cb13afca7fc3509b67a07d48ee7a24361f0e2ce2bfc85c511';

    if (!RPC || !CONTRACT) {
        throw new Error('Missing GENLAYER_RPC_URL or GENLAYER_CONTRACT_ADDRESS');
    }

    try {
        // Create GenLayer client
        const client = createClient({
            chain: localnet,
            endpoint: RPC,
            account: createAccount(PRIVATE_KEY)
        });

        // Encode calldata using GenLayer's calldata format
        const calldataObj = abi.calldata.makeCalldataObject('verify_card', [name, role], undefined);
        const encoded = abi.calldata.encode(calldataObj);

        // RLP encode for transport: [calldata_bytes, leader_only_bool]
        const rlpEncoded = rlp.encode([encoded, 0]);
        const dataHex = '0x' + Buffer.from(rlpEncoded).toString('hex');

        // Make RPC call to contract
        const receipt = await client.request({
            method: 'sim_call',
            params: [{
                type: 'write',
                to: CONTRACT,
                from: client.account.address,
                data: dataHex
            }]
        });

        // Check if execution was successful
        if (receipt.execution_result !== 'SUCCESS') {
            throw new Error(`Contract execution failed: ${receipt.genvm_result?.stderr || 'Unknown error'}`);
        }

        // Decode the result from base64
        const resultBase64 = receipt.result;
        const resultBytes = Buffer.from(resultBase64, 'base64');

        // Try to decode using GenLayer's calldata format
        try {
            const resultData = abi.calldata.decode(resultBytes);

            // Convert to plain object
            const result = {};
            if (resultData && typeof resultData === 'object') {
                if ('verified' in resultData) result.verified = resultData.verified;
                if ('verdict' in resultData) result.verdict = resultData.verdict;
                if ('reason' in resultData) result.reason = resultData.reason;
            }

            return result;
        } catch (decodeError) {
            // Fallback: Extract data from the raw bytes
            // GenLayer calldata contains readable strings we can extract
            const str = resultBytes.toString('utf-8');
            const result = {
                verified: str.includes('verified') && !str.toUpperCase().includes('REJECTED'),
                verdict: str.toUpperCase().includes('REJECTED') ? 'REJECTED' :
                    str.toUpperCase().includes('VERIFIED') ? 'VERIFIED' : 'UNKNOWN',
                reason: ''
            };

            // Try to extract reason text
            const reasonMatch = str.match(/reason[^\w]*([\w\s:]+)/i);
            if (reasonMatch && reasonMatch[1]) {
                result.reason = reasonMatch[1].trim();
            }

            return result;
        }

    } catch (error) {
        console.error('GenLayer verification error:', error);
        throw error;
    }
}
