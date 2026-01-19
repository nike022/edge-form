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

      // Fetch all submissions
      const submissions = [];
      for (const id of submissionIds) {
        try {
          const data = await edgeKv.get(id, { type: 'text' });
          if (data) {
            submissions.push(JSON.parse(data));
          }
        } catch (e) {
          console.error(`Failed to fetch submission ${id}:`, e);
        }
      }

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
