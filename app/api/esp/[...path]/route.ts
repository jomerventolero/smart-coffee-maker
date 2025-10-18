// app/api/esp/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ESP_IP = process.env.NEXT_PUBLIC_ESP_IP || 'http://192.168.18.78';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    const url = new URL(request.url);
    const queryString = url.search;
    
    console.log(`[ESP Proxy] GET /${pathString}${queryString}`);
    
    const response = await fetch(`${ESP_IP}/${pathString}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[ESP Proxy GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to connect to ESP32', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    
    console.log(`[ESP Proxy] POST /${pathString}`);
    console.log(`[ESP Proxy] ESP_IP: ${ESP_IP}`);

    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // Empty body is OK
    }

    const response = await fetch(`${ESP_IP}/${pathString}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log(`[ESP Proxy] Response:`, data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[ESP Proxy POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to connect to ESP32', details: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}