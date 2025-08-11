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
    const { amount, currency = 'EUR', customerInfo } = await request.json();

    console.log('PayPal Environment:', isLive ? 'LIVE' : 'SANDBOX');
    console.log('PayPal Base URL:', PAYPAL_BASE_URL);
    console.log('PayPal Order Request:', { amount, currency, customerInfo });

    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('PayPal credentials missing:', { 
        hasClientId: !!PAYPAL_CLIENT_ID, 
        hasSecret: !!PAYPAL_CLIENT_SECRET,
        clientIdLength: PAYPAL_CLIENT_ID?.length,
        secretLength: PAYPAL_CLIENT_SECRET?.length
      });
      return NextResponse.json(
        { error: 'PayPal credentials not configured' },
        { status: 500 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    // Ensure amount is properly formatted
    const formattedAmount = parseFloat(amount.toString()).toFixed(2);

    // Get country code from customer info
    const getCountryCode = (country: string) => {
      const countryMap: { [key: string]: string } = {
        'Germany': 'DE',
        'Pakistan': 'PK',
        'United States': 'US',
        'United Kingdom': 'GB',
        'France': 'FR',
        'Spain': 'ES',
        'Italy': 'IT',
        'Netherlands': 'NL',
        'Austria': 'AT',
        'Belgium': 'BE',
        'Switzerland': 'CH',
        // Add more countries as needed
      };
      return countryMap[country] || 'DE'; // Default to DE if country not found
    };

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency.toUpperCase(),
            value: formattedAmount,
          },
          shipping: {
            name: {
              full_name: customerInfo?.fullName || 'Customer',
            },
            address: {
              address_line_1: customerInfo?.streetAddress || '',
              address_line_2: customerInfo?.additionalAddress || '',
              admin_area_2: customerInfo?.townCity || '',
              postal_code: customerInfo?.postcode || '',
              country_code: getCountryCode(customerInfo?.country || 'Germany'),
            },
          },
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payments`,
        shipping_preference: 'SET_PROVIDED_ADDRESS',
        user_action: 'PAY_NOW',
        brand_name: 'Daniel E-Com',
      },
    };

    console.log('PayPal Order Data:', JSON.stringify(orderData, null, 2));

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const order = await response.json();

    if (!response.ok) {
      console.error('PayPal API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: order
      });
      return NextResponse.json(
        { error: 'Failed to create PayPal order', details: order },
        { status: 500 }
      );
    }

    console.log('PayPal Order Created Successfully:', order.id);
    return NextResponse.json({ orderID: order.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
