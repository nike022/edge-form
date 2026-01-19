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
      // Parse form submission
      const data = await request.json();
      const { formId, submission } = data;

      if (!formId || !submission) {
        return new Response('Missing formId or submission data', { status: 400 });
      }

      // Initialize EdgeKV
      const edgeKv = new EdgeKV({ namespace: 'edge-form' });

      // Generate submission ID
      const submissionId = `${formId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store submission
      const submissionData = {
        id: submissionId,
        formId,
        data: submission,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('X-Forwarded-For')?.split(',')[0] || request.headers.get('X-Real-IP') || 'unknown',
      };

      // Store as JSON to preserve UTF-8 encoding
      await edgeKv.put(submissionId, JSON.stringify(submissionData), { type: 'json' });

      // Update submissions list with retry mechanism to handle concurrent writes
      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Get existing submissions list
          let submissions = [];
          const existingData = await edgeKv.get(`form_${formId}_submissions`, { type: 'text' });
          if (existingData) {
            submissions = JSON.parse(existingData);
          }

          // Add new submission to list
          submissions.push(submissionId);

          // Store updated submissions list
          await edgeKv.put(`form_${formId}_submissions`, JSON.stringify(submissions));
          break; // Success, exit retry loop
        } catch (e) {
          if (attempt === maxRetries - 1) {
            console.error('Failed to update submissions list after retries:', e);
            // Continue anyway - the submission data is already stored
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
        }
      }

      return new Response(JSON.stringify({
        success: true,
        submissionId
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
