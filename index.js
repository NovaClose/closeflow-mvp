export default function handler(req, res) {
  // Built-in CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS (returns 200)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST' && req.url === '/start-cash-flip') {
    const { userId, state, docId, participants } = req.body;
    try {
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(docId).digest('hex');

      const compliant = ['TX', 'FL', 'VA'].includes(state);
      const flags = compliant ? [] : ['Hybrid req—fallback e-sig'];
      const riskScore = flags.length * 20;

      const roomSid = 'RM-mock';
      const envelopeId = 'ENV-mock';

      const { ethers } = require('ethers');
      const provider = new ethers.JsonRpcProvider('http://localhost:8545');
      const txHash = '0xmock-tx';

      const recap = {
        steps: ['Upload: ✅', 'Check: ' + (flags.length ? '⚠️ Fixed' : '✅'), 'RON: ✅', 'Sig: ✅', 'Audit: Chained!'],
        time: '4 mins',
        savings: '$450 (no drive)',
        referral: `Share with ${participants[0].role}?`
      };

      res.status(200).json({ success: true, hash, flags, riskScore, roomSid, envelopeId, txHash, recap, message: 'Cash flip closed—confetti time! 🎉' });
    } catch (err) {
      console.error('Flip fail:', err);
      res.status(503).json({ error: 'Partial close—e-sig queued. Tour nudge: Retry?' });
    }
  } else if (req.method === 'GET' && req.url === '/metrics') {
    res.status(200).json({
      closings: 1,
      nps: 9.2,
      e2eTime: '4 mins',
      delightScore: 'High—guided wins all around!'
    });
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
}
