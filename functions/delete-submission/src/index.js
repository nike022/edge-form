export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Only allow DELETE requests
    if (request.method !== 'DELETE') {
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
      const submissionId = url.searchParams.get('submissionId');
      const formId = url.searchParams.get('formId');

      if (!submissionId || !formId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing submissionId or formId parameter'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Delete submission data
      await edgeKv.delete(submissionId);

      // Update submissions list with retry mechanism
      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Get existing submissions list
          let submissions = [];
          const existingData = await edgeKv.get(`form_${formId}_submissions`, { type: 'text' });
          if (existingData) {
            submissions = JSON.parse(existingData);
          }

          // Remove submission from list
          submissions = submissions.filter(id => id !== submissionId);

          // Store updated submissions list
          await edgeKv.put(`form_${formId}_submissions`, JSON.stringify(submissions));
          break; // Success, exit retry loop
        } catch (e) {
          if (attempt === maxRetries - 1) {
            console.error('Failed to update submissions list after retries:', e);
            // Continue anyway - the submission data is already deleted
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
        }
      }

      return new Response(JSON.stringify({
        success: true
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
