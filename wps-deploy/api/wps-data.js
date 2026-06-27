module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const APP_ID = process.env.WPS_APP_ID;
  const APP_SECRET = process.env.WPS_APP_SECRET;
  const DOC_ID = process.env.WPS_DOC_ID || '535985864678';

  try {
    const tokenRes = await fetch('https://open.wps.cn/oauthapi/v3/inner/app/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(500).json({ error: '获取token失败', detail: tokenData });
    }

    const token = tokenData.access_token;
    const params = new URLSearchParams();
    if (req.query.filter) params.append('filter', req.query.filter);
    if (req.query.page_size) params.append('page_size', req.query.page_size);
    if (req.query.page_token) params.append('page_token', req.query.page_token);

    const apiUrl = `https://open.wps.cn/openapi/v3/bitable/${DOC_ID}/records?${params.toString()}`;
    const apiRes = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const apiData = await apiRes.json();

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: 'WPS API调用失败', detail: apiData });
    }

    res.status(200).json(apiData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
