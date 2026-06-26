const https = require('https');

function httpsGet(endpoint, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.prod.whoop.com',
      path: '/developer/v1' + endpoint,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };

  const token = event.queryStringParameters && event.queryStringParameters.t;
  const endpoint = event.queryStringParameters && event.queryStringParameters.e;

  if (!token) return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'No token' }) };
  if (!endpoint) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'No endpoint' }) };

  try {
    const result = await httpsGet(decodeURIComponent(endpoint), token);
    return { statusCode: result.status, headers: corsHeaders, body: result.body };
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};
