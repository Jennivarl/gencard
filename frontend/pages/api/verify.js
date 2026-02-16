export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { name, role } = req.body || {};
    // Simple mock logic: reject empty names
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.json({ verified: false, verdict: 'REJECTED', reason: 'Empty name' });
    }
    // Mock similarity check: names shorter than 3 chars rejected
    if (name.trim().length < 3) return res.json({ verified: false, verdict: 'REJECTED', reason: 'Name too short' });

    // Otherwise return VERIFIED mock
    return res.json({ verified: true, verdict: 'VERIFIED', reason: 'Mock verified' });
}
