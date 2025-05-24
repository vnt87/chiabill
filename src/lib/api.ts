export async function getBill(id: string) {
  const response = await fetch(`/api/bills/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bill');
  }
  return response.json();
}

export async function getRecentBills() {
  const response = await fetch('/api/bills');
  if (!response.ok) {
    throw new Error('Failed to fetch bills');
  }
  return response.json();
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

export async function deleteBill(id: string) {
  const response = await fetch(`/api/bills/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete bill');
  }
  return response.json();
}
