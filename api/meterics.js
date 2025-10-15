export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'GET') {
    res.status(200).json({
      closings: 1,
      nps: 9.2,
      e2eTime: '4 mins',
      delightScore: 'High—guided wins all around!'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

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
