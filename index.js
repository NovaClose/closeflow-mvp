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

// v2 Lender Queue Endpoint (doc sync for financed deals)
app.post('/api/lender-queue', async (req, res) => {
  const { userId, docId, lenderEmail, state } = req.body;
  try {
    // Step 1: Hash doc for audit trail
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(docId).digest('hex');

    // Step 2: Mock SQS queue (real: AWS SQS for async sync)
    const queueId = `Q-${Date.now()}-${userId}`;
    const queueStatus = 'queued'; // Sim: 'processing' / 'synced'

    // Step 3: Notification stub (Twilio SMS or email)
    const notification = `Doc ${docId} queued for lender ${lenderEmail} in ${state}. Hash: ${hash.slice(0, 16)}...`;

    // Step 4: Mock sync delay (real: 2 mins avg)
    const syncTime = Math.random() * 120 + 60; // 1-3 mins

    const recap = {
      steps: ['Upload: ✅', 'Queue: Lender notified', 'Sync: In progress', 'Audit: Hashed'],
      time: `${syncTime.toFixed(0)} secs avg`,
      savings: '$300 (no email chase)',
      referral: `Share with lender ${lenderEmail}?`
    };

    // Self-heal: If lenderEmail missing, fallback to email queue
    if (!lenderEmail) {
      throw new Error('Lender email missing—fallback to email queue');
    }

    res.json({ success: true, queueId, queueStatus, notification, recap, message: 'Doc queued for lender—sync in 2 mins!' });
  } catch (err) {
    console.error('Queue fail:', err);
    res.status(503).json({ error: 'Queue failed—retry with lender email?', fallback: 'Email queue activated' });
  }
});

// Metrics endpoint (real-time sim for retention)
app.get('/api/metrics', (req, res) => {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const closingsThisWeek = Math.floor(Math.random() * 12) + 5; // Sim 5-16
  const nps = 9.2 + (Math.random() - 0.5) * 0.4; // 8.8-9.6
  const dropOffRate = (Math.random() * 5).toFixed(1); // 0-5%

  res.json({
    closingsThisWeek,
    nps: nps.toFixed(1),
    dropOffRate: `${dropOffRate}%`,
    e2eTime: '4 mins avg',
    delightScore: 'High—guided wins all around!',
    lastUpdate: now.toISOString()
  });
});

// v1.1 Lender Queue (doc sync for financed deals)
app.post('/api/lender-queue', async (req, res) => {
  const { userId, docId, lenderEmail, state } = req.body;
  try {
    // Hash doc for audit
    const hash = crypto.createHash('sha256').update(docId).digest('hex');

    // Mock queue ID (real: SQS for async)
    const queueId = `Q-${Date.now()}-${userId}`;
    const queueStatus = 'queued';

    // Mock notification (real: Twilio SMS)
    const notification = `Doc ${docId} queued for ${lenderEmail} in ${state}. Hash: ${hash.slice(0, 16)}...`;

    // Mock sync time (1-3 mins)
    const syncTime = Math.random() * 120 + 60;

    const recap = {
      steps: ['Upload: ✅', 'Queue: Lender notified', 'Sync: In progress', 'Audit: Hashed'],
      time: `${syncTime.toFixed(0)} secs avg`,
      savings: '$300 (no email chase)',
      referral: `Share with lender ${lenderEmail}?`
    };

    // Self-heal if no email
    if (!lenderEmail) {
      throw new Error('Lender email missing—fallback to email queue');
    }

    res.json({ success: true, queueId, queueStatus, notification, recap, message: 'Doc queued for lender—sync in 2 mins!' });
  } catch (err) {
    console.error('Queue fail:', err);
    res.status(503).json({ error: 'Queue failed—retry with lender email?', fallback: 'Email queue activated' });
  }
});

// Vercel handler wrapper (fixes subroute 404)
module.exports = (req, res) => {
  app(req, res);
};
// Lender queue endpoint (v2)
app.post('/api/lender-queue', async (req, res) => {
  const { userId, docId, lenderEmail } = req.body;
  try {
    // Mock queue (real: SQS or Redis for doc sync)
    const queueId = `Q-${Date.now()}`;
    const recap = {
      steps: ['Upload: ✅', 'Queue: Lender notified', 'Sync: Pending'],
      time: '2 mins avg',
      savings: '$300 (no email chase)',
      referral: `Share with lender ${lenderEmail}?`
    };

    res.json({ success: true, queueId, recap, message: 'Doc queued for lender—sync in 2 mins!' });
  } catch (err) {
    console.error('Queue fail:', err);
    res.status(503).json({ error: 'Queue failed—retry?' });
  }
});



