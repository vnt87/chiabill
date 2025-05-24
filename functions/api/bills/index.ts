import { KVNamespace } from '@cloudflare/workers-types';
import { BillData } from '../../../src/types';

interface Env {
  BILLS: KVNamespace;
}

interface BillWithMetadata extends BillData {
  id: string;
  created_at: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  // Handle CORS preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
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
      const listKey = 'bill_list';
      const existingList = await context.env.BILLS.get(listKey, 'json') as string[] || [];
      existingList.unshift(id);
      await context.env.BILLS.put(listKey, JSON.stringify(existingList));

      return new Response(JSON.stringify(billWithMetadata), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response('Invalid request data', { status: 400 });
    }
  }

  if (context.request.method === 'GET') {
    try {
      const listKey = 'bill_list';
      const billIds = await context.env.BILLS.get(listKey, 'json') as string[] || [];
      const bills: BillWithMetadata[] = [];

      // Fetch the most recent 50 bills
      const limit = Math.min(billIds.length, 50);
      for (let i = 0; i < limit; i++) {
        const bill = await context.env.BILLS.get(billIds[i], 'json') as BillWithMetadata;
        if (bill) {
          bills.push(bill);
        }
      }

      return new Response(JSON.stringify(bills), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};
