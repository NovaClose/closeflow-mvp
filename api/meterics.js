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
