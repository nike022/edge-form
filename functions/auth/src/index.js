export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { password } = await request.json();

      if (!password) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Password required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Initialize EdgeKV
      const edgeKv = new EdgeKV({ namespace: 'edge-form' });

      // Get stored password hash
      const storedHash = await edgeKv.get('admin_password_hash', { type: 'text' });

      if (!storedHash) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Password not configured'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Simple hash comparison (in production, use proper bcrypt)
      const passwordHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password)
      );
      const hashHex = Array.from(new Uint8Array(passwordHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (hashHex !== storedHash) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid password'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Generate JWT token
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = {
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
        iat: Math.floor(Date.now() / 1000)
      };

      const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
      const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
      const signatureInput = `${encodedHeader}.${encodedPayload}`;

      // Get JWT secret
      const jwtSecret = await edgeKv.get('jwt_secret', { type: 'text' });
      if (!jwtSecret) {
        return new Response(JSON.stringify({
          success: false,
          error: 'JWT secret not configured'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(jwtSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(signatureInput)
      );

      const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const token = `${signatureInput}.${encodedSignature}`;

      return new Response(JSON.stringify({
        success: true,
        token
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
};
