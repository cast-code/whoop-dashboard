exports.handler = async () => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    clientId: process.env.WHOOP_CLIENT_ID,
    redirectUri: process.env.WHOOP_REDIRECT_URI
  })
});
