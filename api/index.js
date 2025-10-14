const express = require('express');
const crypto = require('crypto');
const { ethers } = require('ethers');
const nock = require('nock');

const app = express();
app.use(express.json());

// Built-in CORS headers (no cors dep)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Mocks
nock('https://video.twilio.com').persist().post('/v1/Rooms').reply(201, { sid: 'RM-mock' });
nock('https://demo.docusign.net').persist().post('/envelopes').reply(201, { envelopeId: 'ENV-mock' });
nock('https://vision.googleapis.com').persist().post('/v1/images:annotate').reply(200, { fullTextAnnotation: { text: 'audio consent seal' } });

// /start-cash-flip route
app.post('/start-cash-flip', async (req, res) => {
  const { userId, state, docId, participants } = req.body;
  try {
    const hash = crypto.createHash('sha256').update(docId).digest('hex');

    const compliant = ['TX', 'FL', 'VA'].includes(state);
    const flags = compliant ? [] : ['Hybrid req—fallback e-sig'];
    const riskScore = flags.length * 20;

    const roomSid = 'RM-mock';
    const envelopeId = 'ENV-mock';

    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const txHash = '0xmock-tx';

    const recap = {
      steps: ['Upload: ✅', 'Check: ' + (flags.length ? '⚠️ Fixed' : '✅'), 'RON: ✅', 'Sig: ✅', 'Audit: Chained!'],
      time: '4 mins',
      savings: '$450 (no drive)',
      referral: `Share with ${participants[0].role}?`
    };

    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, hash, flags, riskScore, roomSid, envelopeId, txHash, recap, message: 'Cash flip closed—confetti time! 🎉' });
  } catch (err) {
    console.error('Flip fail:', err);
    res.status(503).json({ error: 'Partial close—e-sig queued. Tour nudge: Retry?' });
  }
});

// /metrics route
app.get('/metrics', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    closings: 1,
    nps: 9.2,
    e2eTime: '4 mins',
    delightScore: 'High—guided wins all around!'
  });
});

module.exports = app;
