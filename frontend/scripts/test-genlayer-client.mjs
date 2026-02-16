// Test GenLayer Client with actual contract call
import { createClient, createAccount, abi } from 'genlayer-js';
import { localnet } from 'genlayer-js/chains';

console.log('ABI module:', typeof abi);
console.log('ABI keys:', abi ? Object.keys(abi) : 'null');

const client = createClient({
    chain: localnet,
    endpoint: 'http://localhost:4000/api',
    account: createAccount('0xc8dccd4e1dbe0c1cb13afca7fc3509b67a07d48ee7a24361f0e2ce2bfc85c511')
});

const contractAddress = '0xEeD8c849A8846fB91fa05EfDE127F25C82b179cd';

console.log('\nTesting GenLayer contract call...');
console.log('Contract:', contractAddress);
console.log('Account:', client.account.address);

try {
    // Check if abi has calldata methods
    if (abi && abi.calldata) {
        console.log('\n📦 ABI.calldata methods:', Object.keys(abi.calldata));

        // Try encoding the calldata
        const calldataObj = abi.calldata.makeCalldataObject('verify_card', ['Alice', 'neuron'], undefined);
        console.log('Calldata object:', calldataObj);

        const encoded = abi.calldata.encode(calldataObj);
        console.log('Encoded (length):', encoded.length);

        const hex = '0x' + Buffer.from(encoded).toString('hex');
        console.log('Hex:', hex);
        console.log('Hex length:', hex.length);

        // Now make the RPC call with the proper encoded data
        const rlp = await import('rlp');
        const rlpEncoded = rlp.default.encode([encoded, 0]); // [calldata, leader_only]
        const dataHex = '0x' + Buffer.from(rlpEncoded).toString('hex');

        console.log('\n🔄 Making RPC call...');
        const result = await client.request({
            method: 'sim_call',
            params: [{
                type: 'write',
                to: contractAddress,
                from: client.account.address,
                data: dataHex
            }]
        });

        console.log('\n✅ Contract call successful!');
        console.log('Result:', JSON.stringify(result, null, 2));
    } else {
        console.log('❌ ABI.calldata not available');
    }
} catch (error) {
    console.error('\n❌ Error:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
}
