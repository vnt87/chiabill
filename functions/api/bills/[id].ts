import { KVNamespace } from '@cloudflare/workers-types';
import { BillWithMetadata } from '../../../src/types';
import { BILL_LIST_KEY, JSON_HEADERS, bumpRevision } from '../../_lib/billsStore';

interface Env {
  BILLS: KVNamespace;
}

interface PaidUpdate {
  playerIndex: number;
  paid: boolean;
}

function parsePaidUpdate(value: unknown): PaidUpdate | null {
  if (typeof value !== 'object' || value === null) return null;
  const { playerIndex, paid } = value as Record<string, unknown>;
  if (typeof paid !== 'boolean') return null;
  if (typeof playerIndex !== 'number' || !Number.isInteger(playerIndex) || playerIndex < 0) return null;
  return { playerIndex, paid };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const id = context.params.id as string;

  // Handle CORS preflight request
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PATCH, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    if (context.request.method === 'DELETE') {
      await context.env.BILLS.delete(id);

      const billIds = await context.env.BILLS.get(BILL_LIST_KEY, 'json') as string[] || [];
      if (billIds.includes(id)) {
        await context.env.BILLS.put(BILL_LIST_KEY, JSON.stringify(billIds.filter((billId) => billId !== id)));
      }
      const rev = await bumpRevision(context.env.BILLS);

      return new Response(JSON.stringify({ success: true, rev }), { headers: JSON_HEADERS });
    }

    if (context.request.method === 'PATCH') {
      let update: PaidUpdate | null;
      try {
        update = parsePaidUpdate(await context.request.json());
      } catch {
        update = null;
      }
      if (!update) {
        return new Response('Expected { playerIndex: number, paid: boolean }', { status: 400 });
      }

      const bill = await context.env.BILLS.get(id, 'json') as BillWithMetadata | null;
      if (!bill) {
        return new Response('Bill not found', { status: 404 });
      }
      const player = bill.players[update.playerIndex];
      if (!player) {
        return new Response('Player not found', { status: 400 });
      }

      if (update.paid) {
        player.paid = true;
        player.paidAt = new Date().toISOString();
      } else {
        delete player.paid;
        delete player.paidAt;
      }

      await context.env.BILLS.put(id, JSON.stringify(bill));
      const rev = await bumpRevision(context.env.BILLS);

      return new Response(JSON.stringify({ bill, rev }), { headers: JSON_HEADERS });
    }

    // GET request - fetch bill
    const bill = await context.env.BILLS.get(id, 'json');

    if (!bill) {
      return new Response('Bill not found', { status: 404 });
    }

    return new Response(JSON.stringify(bill), { headers: JSON_HEADERS });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
};
