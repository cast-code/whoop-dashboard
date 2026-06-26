const https = require('https');
const querystring = require('querystring');

function httpsPost(url, data) {
  return new Promise((resolve, reject) => {
    const body = querystring.stringify(data);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: responseData }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { code, grant_type, refresh_token, redirectUri } = JSON.parse(event.body);
    const CLIENT_ID = process.env.WHOOP_CLIENT_ID;
    const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET;
    const REDIRECT_URI = redirectUri || process.env.WHOOP_REDIRECT_URI;

    const params = { client_id: CLIENT_ID, client_secret: CLIENT_SECRET };

    if (grant_type === 'authorization_code') {
      params.grant_type = 'authorization_code';
      params.code = code;
      params.redirect_uri = REDIRECT_URI;
    } else if (grant_type === 'refresh_token') {
      params.grant_type = 'refresh_token';
      params.refresh_token = refresh_token;
      params.scope = 'offline';
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid grant type' }) };
    }

    const result = await httpsPost('https://api.prod.whoop.com/oauth/oauth2/token', params);
    return { statusCode: result.status, headers, body: result.body };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', detail: err.message }) };
  }
};
