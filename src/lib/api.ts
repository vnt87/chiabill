import type { BillWithMetadata } from '../types';

export async function getBill(id: string): Promise<BillWithMetadata> {
  const response = await fetch(`/api/bills/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bill');
  }
  return response.json();
}

export type RecentBillsResult =
  | { status: 'unchanged' }
  | { status: 'updated'; bills: BillWithMetadata[]; etag: string };

// Pass the etag of the cached list; the server answers 304 when nothing changed.
export async function getRecentBills(cachedEtag?: string): Promise<RecentBillsResult> {
  const response = await fetch('/api/bills', {
    headers: cachedEtag ? { 'If-None-Match': cachedEtag } : undefined,
  });
  if (response.status === 304) {
    return { status: 'unchanged' };
  }
  if (!response.ok) {
    throw new Error('Failed to fetch bills');
  }
  const bills: BillWithMetadata[] = await response.json();
  return { status: 'updated', bills, etag: response.headers.get('ETag') ?? '' };
}

export async function saveBill(bill: any) {
  const response = await fetch('/api/bills', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bill),
  });
  if (!response.ok) {
    throw new Error('Failed to save bill');
  }
  return response.json();
}

export async function deleteBill(id: string): Promise<{ success: boolean; rev?: string }> {
  const response = await fetch(`/api/bills/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete bill');
  }
  return response.json();
}

export async function setPlayerPaid(
  id: string,
  playerIndex: number,
  paid: boolean,
): Promise<{ bill: BillWithMetadata; rev: string }> {
  const response = await fetch(`/api/bills/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerIndex, paid }),
  });
  if (!response.ok) {
    throw new Error('Failed to update payment');
  }
  return response.json();
}
