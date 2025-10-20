// lib/espClient.ts
const ESP_IP = process.env.NEXT_PUBLIC_ESP_IP || 'http://192.168.18.78';

async function espGet(path: string, queryParams: Record<string, string> = {}) {
  const queryString = new URLSearchParams(queryParams).toString();
  const url = `${ESP_IP}/${path}${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`ESP GET failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[ESP GET Error]', err);
    throw err;
  }
}

async function espPost(path: string, body: any = {}) {
  const url = `${ESP_IP}/${path}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`ESP POST failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[ESP POST Error]', err);
    throw err;
  }
}

export { espGet, espPost };
