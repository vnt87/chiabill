import { KVNamespace } from '@cloudflare/workers-types';
import { BillData, BillWithMetadata } from '../../../src/types';
import {
  BILL_LIST_KEY,
  JSON_HEADERS,
  LIST_LIMIT,
  bumpRevision,
  etagFor,
  getRevision,
} from '../../_lib/billsStore';

interface Env {
  BILLS: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  // Handle CORS preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
      },
    });
  }

  if (context.request.method === 'POST') {
    try {
      const billData: BillData = await context.request.json();
      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      // Store the bill with metadata
      const billWithMetadata: BillWithMetadata = {
        ...billData,
        id,
        created_at: timestamp,
      };

      await context.env.BILLS.put(id, JSON.stringify(billWithMetadata));

      // Store the ID in a list for retrieval
      const existingList = await context.env.BILLS.get(BILL_LIST_KEY, 'json') as string[] || [];
      existingList.unshift(id);
      await context.env.BILLS.put(BILL_LIST_KEY, JSON.stringify(existingList));
      await bumpRevision(context.env.BILLS);

      return new Response(JSON.stringify(billWithMetadata), { headers: JSON_HEADERS });
    } catch (error) {
      return new Response('Invalid request data', { status: 400 });
    }
  }

  if (context.request.method === 'GET') {
    try {
      const rev = await getRevision(context.env.BILLS);
      const etag = etagFor(rev);
      const cacheHeaders = {
        ETag: etag,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'ETag',
      };

      // Nothing changed since the client's copy: skip every per-bill read.
      if (context.request.headers.get('If-None-Match') === etag) {
        return new Response(null, { status: 304, headers: cacheHeaders });
      }

      const billIds = await context.env.BILLS.get(BILL_LIST_KEY, 'json') as string[] || [];
      const found = await Promise.all(
        billIds.slice(0, LIST_LIMIT).map((id) => context.env.BILLS.get(id, 'json') as Promise<BillWithMetadata | null>),
      );
      const bills = found.filter((bill): bill is BillWithMetadata => bill !== null);

      return new Response(JSON.stringify(bills), {
        headers: { ...cacheHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};
