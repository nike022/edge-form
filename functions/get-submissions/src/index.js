export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const url = new URL(request.url);
      const formId = url.searchParams.get('formId');

      if (!formId) {
        return new Response('Missing formId parameter', { status: 400 });
      }

      // Initialize EdgeKV
      const edgeKv = new EdgeKV({ namespace: 'edge-form' });

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
