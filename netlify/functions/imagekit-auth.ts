import type { Handler } from '@netlify/functions';
import ImageKit from '@imagekit/nodejs';

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

if (!privateKey) {
  throw new Error('IMAGEKIT_PRIVATE_KEY environment variable is not set');
}

const imagekit = new ImageKit({
  privateKey,
});

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const authParams = imagekit.helper.getAuthenticationParameters();
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(authParams),
    };
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to generate authentication parameters',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
