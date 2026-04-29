/**
 * API Proxy for OpenAI/Third-party API
 * Path: /api/chat
 */
export async function onRequestPost(context) {
  const { env, request } = context;
  
  // From environment variables in Cloudflare dashboard
  const targetBaseUrl = env.THIRD_PARTY_API_URL;
  const apiKey = env.THIRD_PARTY_API_KEY;

  if (!targetBaseUrl || !apiKey) {
    return new Response(JSON.stringify({ 
      error: "Server configuration error: Missing API URL or Key" 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse original request body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Construct request to the real API
  try {
    const response = await fetch(`${targetBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // Return the response back to the client
    const responseData = await response.json();
    
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
