export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'POST') {
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
