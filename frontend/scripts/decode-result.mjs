// Decode the result from the successful contract call
const base64Result = "AB4GcmVhc29uhAJWZXJpZmljYXRpb24gZXJyb3I6IDY6IGZvcmJpZGRlbgd2ZXJkaWN0RFJFSkVDVEVECHZlcmlmaWVkCA==";

const decoded = Buffer.from(base64Result, 'base64');
console.log('Decoded bytes:', decoded);
console.log('Decoded hex:', decoded.toString('hex'));
console.log('Decoded as string:', decoded.toString('utf-8'));

// Try to parse it
try {
    // It looks like a GenLayer calldata format, let's see if it contains readable text
    const str = decoded.toString();
    console.log('\nReadable parts:', str.match(/[a-zA-Z0-9_\s:]+/g));
} catch (e) {
    console.error('Error:', e.message);
}

// Try importing genlayer-js abi to decode it properly
import { abi } from 'genlayer-js';

try {
    const calldataDecoded = abi.calldata.decode(decoded);
    console.log('\n✅ Calldata decoded:', calldataDecoded);
    console.log('As string:', abi.calldata.toString(calldataDecoded));
} catch (e) {
    console.error('\n❌ Calldata decode error:', e.message);
}
