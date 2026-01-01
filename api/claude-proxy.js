// ============================================================================
// VERCEL SERVERLESS FUNCTION - Claude API Proxy
// This fixes CORS errors and securely forwards API calls to Anthropic
// ============================================================================

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey, model, max_tokens, messages } = req.body;

    // Validate API key
    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }

    console.log('[Proxy] Forwarding request to Claude API...');
    console.log('[Proxy] Model:', model);
    console.log('[Proxy] Max tokens:', max_tokens);

    // Forward request to Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Proxy] Claude API error:', response.status, data);
      return res.status(response.status).json(data);
    }

    console.log('[Proxy] Success! Returning response');
    return res.status(200).json(data);

  } catch (error) {
    console.error('[Proxy] Error:', error.message);
    return res.status(500).json({ 
      error: 'Proxy error',
      message: error.message 
    });
  }
}
