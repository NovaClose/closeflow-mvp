const express = require('express');
const cors = require('cors');
const nock = require('nock');
const crypto = require('crypto');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

// Explicit OPTIONS for preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

// Mocks setup
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

    res.json({ success: true, hash, flags, riskScore, roomSid, envelopeId, txHash, recap, message: 'Cash flip closed—confetti time! 🎉' });
  } catch (err) {
    console.error('Flip fail:', err);
    res.status(503).json({ error: 'Partial close—e-sig queued. Tour nudge: Retry?' });
  }
});

// /metrics route
app.get('/metrics', (req, res) => {
  res.json({
    closings: 1,
    nps: 9.2,
    e2eTime: '4 mins',
    delightScore: 'High—guided wins all around!'
  });
});

// Vercel handler wrapper (fixes subroute 404)
module.exports = (req, res) => {
  app(req, res);
};
