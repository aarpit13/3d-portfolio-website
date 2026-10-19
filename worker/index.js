// Cloudflare Worker: upload + save API for the admin page.
// Every request must carry the ADMIN_TOKEN secret as a Bearer token.

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    if (request.headers.get('Authorization') !== `Bearer ${env.ADMIN_TOKEN}`) {
      return new Response('Wrong password', { status: 401, headers: cors });
    }

    const url = new URL(request.url);
    const clean = (s) => (s || '').replace(/[^a-zA-Z0-9._-]/g, '_');

    // POST /upload?folder=my-project&name=clip.mp4  (body = the file)
    if (url.pathname === '/upload' && request.method === 'POST') {
      const key = `${clean(url.searchParams.get('folder')) || 'misc'}/${Date.now()}-${clean(url.searchParams.get('name')) || 'file'}`;
      await env.MEDIA.put(key, request.body, {
        httpMetadata: { contentType: request.headers.get('Content-Type') || 'application/octet-stream' }
      });
      return Response.json({ url: `${env.PUBLIC_URL}/${key}` }, { headers: cors });
    }

    // GET /projects  -> current list
    if (url.pathname === '/projects' && request.method === 'GET') {
      const obj = await env.MEDIA.get('projects.json');
      return new Response(obj ? obj.body : '[]', {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // PUT /projects  -> save the whole list
    if (url.pathname === '/projects' && request.method === 'PUT') {
      const body = await request.text();
      JSON.parse(body); // throws if it isn't valid JSON
      await env.MEDIA.put('projects.json', body, {
        httpMetadata: { contentType: 'application/json', cacheControl: 'no-cache' }
      });
      return Response.json({ ok: true }, { headers: cors });
    }

    return new Response('Not found', { status: 404, headers: cors });
  }
};
