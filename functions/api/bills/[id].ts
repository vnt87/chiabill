import { KVNamespace } from '@cloudflare/workers-types';

interface Env {
  BILLS: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const id = context.params.id as string;

  // Handle CORS preflight request
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    if (context.request.method === 'DELETE') {
      // Delete bill
      await context.env.BILLS.delete(id);
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // GET request - fetch bill
    const bill = await context.env.BILLS.get(id, 'json');
    
    if (!bill) {
      return new Response('Bill not found', { status: 404 });
    }

    return new Response(JSON.stringify(bill), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
};
