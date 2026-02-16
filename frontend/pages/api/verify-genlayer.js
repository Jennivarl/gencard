import { verifyWithGenLayer } from '../../lib/genlayerClient';

// Mock verification function as fallback
function getMockVerification(name, role) {
    const validRoles = ['neuron', 'synapse intern', 'synapse', 'brain intern', 'brain', 'singularity'];
    const isValid = name && name.length > 0 && validRoles.includes(role);

    if (!isValid) {
        return {
            verified: false,
            verdict: 'REJECTED',
            reason: 'Invalid name or role provided.',
            nickname: ''
        };
    }

    // Generate fun nickname based on role
    const nicknamesByRole = {
        'neuron': ['Neural Ninja', 'Net Navigator', 'Neuron Knight', 'Signal Sender', 'Brain Cell Boss'],
        'synapse intern': ['Synapse Starter', 'Connection Cadet', 'Link Learner', 'Junction Junior', 'Gap Guru'],
        'synapse': ['Synapse Surfer', 'Connection Commander', 'Bridge Builder', 'Gap Guardian', 'Link Legend'],
        'brain intern': ['Brain Buddy', 'Cortex Cadet', 'Think Tank Trainee', 'Mind Mender', 'Neuron Newbie'],
        'brain': ['Brain Boss', 'Cortex Captain', 'Mind Master', 'Think Tank', 'Neural Network'],
        'singularity': ['Singularity Sage', 'AI Architect', 'Future Fusion', 'Ultimate Unified', 'Omega Operator']
    };

    const nicknames = nicknamesByRole[role] || ['GenFren Champion'];
    const nickname = nicknames[Math.floor(Math.random() * nicknames.length)];

    // Simulate AI verification
    const patterns = ['is original and appropriate', 'looks good', 'verified successfully', 'seems legitimate'];
    const reason = patterns[Math.floor(Math.random() * patterns.length)];

    return {
        verified: true,
        verdict: 'VERIFIED',
        reason: `${name} ${reason}.`,
        nickname: nickname
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { name, role } = req.body || {};
    if (!name || !role) return res.status(400).json({ error: 'Missing name or role' });

    try {
        const result = await verifyWithGenLayer(name, role);

        // Check if GenLayer returned an LLM provider error and fall back to mock
        if (result.reason && result.reason.includes('forbidden')) {
            console.log('GenLayer LLM provider not configured, using mock verification');
            const mockResult = getMockVerification(name, role);
            return res.json({ success: true, data: mockResult, source: 'mock' });
        }

        // Add nickname to GenLayer result
        const nicknamesByRole = {
            'neuron': ['Neural Ninja', 'Net Navigator', 'Neuron Knight', 'Signal Sender', 'Brain Cell Boss'],
            'synapse intern': ['Synapse Starter', 'Connection Cadet', 'Link Learner', 'Junction Junior', 'Gap Guru'],
            'synapse': ['Synapse Surfer', 'Connection Commander', 'Bridge Builder', 'Gap Guardian', 'Link Legend'],
            'brain intern': ['Brain Buddy', 'Cortex Cadet', 'Think Tank Trainee', 'Mind Mender', 'Neuron Newbie'],
            'brain': ['Brain Boss', 'Cortex Captain', 'Mind Master', 'Think Tank', 'Neural Network'],
            'singularity': ['Singularity Sage', 'AI Architect', 'Future Fusion', 'Ultimate Unified', 'Omega Operator']
        };
        const nicknames = nicknamesByRole[role] || ['GenFren Champion'];
        result.nickname = nicknames[Math.floor(Math.random() * nicknames.length)];

        return res.json({ success: true, data: result, source: 'genlayer' });
    } catch (err) {
        // If environment is not configured, use mock verification
        if (String(err.message).includes('Missing GENLAYER_RPC_URL') || String(err.message).includes('GENLAYER_CONTRACT_ADDRESS')) {
            console.log('GenLayer not configured, using mock verification');
            const mockResult = getMockVerification(name, role);
            return res.json({ success: true, data: mockResult, source: 'mock' });
        }

        // For any other GenLayer errors, fall back to mock
        console.log('GenLayer error, falling back to mock:', err.message);
        const mockResult = getMockVerification(name, role);
        return res.json({ success: true, data: mockResult, source: 'mock' });
    }
}
