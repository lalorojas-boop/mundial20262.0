export default async function handler(req, res) {
  const path = req.url.replace('/api/proxy', '');
  const apiUrl = `https://api.football-data.org/v4${path}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      'X-Auth-Token': '08b94a5548b348d4b1c4c089205114f5',
    },
  });
  
  const data = await response.json();
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.status(response.status).json(data);
}
