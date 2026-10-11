import type { KVNamespace } from '@cloudflare/workers-types';

export const BILL_LIST_KEY = 'bill_list';
export const BILLS_REV_KEY = 'bills_rev';
export const LIST_LIMIT = 50;

export const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function getRevision(kv: KVNamespace): Promise<string> {
  return (await kv.get(BILLS_REV_KEY)) ?? '0';
}

// The revision is the list's cache validator: bump it on every create, delete and update.
export async function bumpRevision(kv: KVNamespace): Promise<string> {
  const rev = crypto.randomUUID();
  await kv.put(BILLS_REV_KEY, rev);
  return rev;
}

export function etagFor(rev: string): string {
  return `"${rev}"`;
}
