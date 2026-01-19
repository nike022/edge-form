export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Verify JWT token
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Unauthorized'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const token = authHeader.substring(7);
      const [headerB64, payloadB64, signatureB64] = token.split('.');

      if (!headerB64 || !payloadB64 || !signatureB64) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid token'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Initialize EdgeKV
      const edgeKv = new EdgeKV({ namespace: 'edge-form' });

      // Get JWT secret and verify signature
      const jwtSecret = await edgeKv.get('jwt_secret', { type: 'text' });
      if (!jwtSecret) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Server configuration error'
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
        ['verify']
      );

      const signatureInput = `${headerB64}.${payloadB64}`;
      const signatureBytes = Uint8Array.from(
        atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/').padEnd(signatureB64.length + (4 - signatureB64.length % 4) % 4, '=')),
        c => c.charCodeAt(0)
      );

      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        signatureBytes,
        new TextEncoder().encode(signatureInput)
      );

      if (!isValid) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid token'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Check token expiration
      const payload = JSON.parse(atob(payloadB64));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Token expired'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const url = new URL(request.url);
      const formId = url.searchParams.get('formId');

      if (!formId) {
        return new Response('Missing formId parameter', { status: 400 });
      }

      // Get submissions list for this form
      const submissionsData = await edgeKv.get(`form_${formId}_submissions`, { type: 'text' });

      if (!submissionsData) {
        return new Response(JSON.stringify({
          success: true,
          submissions: []
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const submissionIds = JSON.parse(submissionsData);

      // Fetch only the last 50 submissions to avoid timeout
      const recentIds = submissionIds.slice(-50);
      const submissions = [];
      for (const id of recentIds) {
        try {
          const data = await edgeKv.get(id, { type: 'json' });
          if (data) {
            // When using type: 'json', EdgeKV returns parsed object
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            submissions.push(parsedData);
          }
        } catch (e) {
          console.error(`Failed to fetch submission ${id}:`, e);
        }
      }

      // Sort by timestamp descending (newest first)
      submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return new Response(JSON.stringify({
        success: true,
        submissions
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
