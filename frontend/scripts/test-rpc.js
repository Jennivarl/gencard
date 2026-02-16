// Test GenLayer RPC encoding
const rlp = require('rlp');

// Try different calldata formats to find the correct one
const method = 'verify_card';
const args = ['Alice', 'neuron'];

// Format 1: Simple tuple [method, ...args]
const calldata1 = JSON.stringify([method, ...args]);

// Format 2: Method name only + args separate (like ABI)  
const calldata2 = JSON.stringify(args);

// Let's try format 2 first (just the args, method inferred from signature)
const calldata = calldata2;

// RLP encode: [calldata_bytes, leader_only_bool]
const calldataBytes = Buffer.from(calldata, 'utf-8');
const leaderOnly = false;
const rlpEncoded = rlp.encode([calldataBytes, leaderOnly ? 1 : 0]);

// Convert to hex properly - rlp.encode returns Uint8Array
const dataHex = '0x' + Buffer.from(rlpEncoded).toString('hex');

console.log('Calldata:', calldata);
console.log('RLP Encoded:', dataHex); console.log('Length:', dataHex.length);

// Test RPC call
const rpcBody = {
    jsonrpc: '2.0',
    id: 1,
    method: 'sim_call',
    params: [{
        type: 'write',
        to: '0xEeD8c849A8846fB91fa05EfDE127F25C82b179cd',
        from: '0x5aeda56215b167893e80b4fe645ba6d5bab767de',
        data: dataHex
    }]
};

console.log('\nRPC Request:', JSON.stringify(rpcBody, null, 2));

// Make the call
fetch('http://localhost:4000/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rpcBody)
})
    .then(r => r.json())
    .then(result => {
        console.log('\nRPC Response:', JSON.stringify(result, null, 2));
    })
    .catch(err => {
        console.error('\nError:', err.message);
    });
