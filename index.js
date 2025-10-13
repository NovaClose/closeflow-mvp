const express = require('express');
const cors = require('cors'); // Add this for browser fetches
const nock = require('nock');
const crypto = require('crypto');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // Add this line

// Mocks setup (self-heal: Fallbacks built-in)
nock('https://video.twilio.com').persist().post('/v1/Rooms').reply(201, { sid: 'RM-mock' });
nock('https://demo.docusign.net').persist().post('/envelopes').reply(201, { envelopeId: 'ENV-mock' });
nock('https://vision.googleapis.com').persist().post('/v1/images:annotate').reply(200, { fullTextAnnotation: { text: 'audio consent seal' } });

// Consolidated /start-cash-flip (E2E: Upload → Check → RON → Sig → Audit)
app.post('/start-cash-flip', async (req, res) => {
  const { userId, state, docId, participants } = req.body;
  try {
    // Step 1: Mock Upload & Hash
    const hash = crypto.createHash('sha256').update(docId).digest('hex');

    // Step 2: AI Compliance Check (Geo-smart)
    const compliant = ['TX', 'FL', 'VA'].includes(state); // Expand to 47-state map
    const flags = compliant ? [] : ['Hybrid req—fallback e-sig'];
    const riskScore = flags.length * 20;

    // Step 3: RON Room + E-Sig (Parallel, with tour nudge)
    const roomSid = 'RM-mock'; // Twilio fallback if nock fails
    const envelopeId = 'ENV-mock';

    // Step 4: Blockchain Audit (Local fallback)
    const provider = new ethers.JsonRpcProvider('http://localhost:8545'); // Mock
    const txHash = '0xmock-tx'; // Sim chain

    // E2E Delight: Guided recap
    const recap = {
      steps: ['Upload: ✅', 'Check: ' + (flags.length ? '⚠️ Fixed' : '✅'), 'RON: ✅', 'Sig: ✅', 'Audit: Chained!'],
      time: '4 mins',
      savings: '$450 (no drive)',
      referral: `Share with ${participants[0].role}?`
    };

    res.json({ success: true, hash, flags, riskScore, roomSid, envelopeId, txHash, recap, message: 'Cash flip closed—confetti time! 🎉' });
  } catch (err) {
    // Self-heal: Graceful fallback
    console.error('Flip fail:', err);
    res.status(503).json({ error: 'Partial close—e-sig queued. Tour nudge: Retry?' });
  }
});

// Metrics Recap (Post-flow dashboard)
app.get('/metrics', (req, res) => {
  res.json({
    closings: 1, // Sim increment
    nps: 9.2,
    e2eTime: '4 mins',
    delightScore: 'High—guided wins all around!'
  });
});

module.exports = app;
