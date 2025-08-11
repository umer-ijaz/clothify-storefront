import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || process.env.NEXT_PUBLIC_PAYPAL_SECRET_KEY;

// Determine if we're using sandbox or live based on client ID
const isLive = PAYPAL_CLIENT_ID?.startsWith('A') && !PAYPAL_CLIENT_ID?.includes('sandbox');
const PAYPAL_BASE_URL = isLive 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials are not configured');
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal token response error:', error);
      throw new Error(`Failed to get PayPal access token: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    if (!data.access_token) {
      throw new Error('No access token received from PayPal');
    }

    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderID } = await request.json();

    if (!orderID) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'PayPal credentials not configured' },
        { status: 500 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await response.json();

    if (!response.ok) {
      console.error('PayPal Capture Error:', captureData);
      return NextResponse.json(
        { error: 'Failed to capture PayPal payment', details: captureData },
        { status: 500 }
      );
    }

    // Extract transaction details
    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const transactionId = capture?.id;
    const status = capture?.status;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'No transaction ID found in PayPal response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderID,
      transactionId,
      status,
      captureData,
    });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
