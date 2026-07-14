import type { Handler } from '@netlify/functions';
import ImageKit from '@imagekit/nodejs';

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const authParams = imagekit.helper.getAuthenticationParameters();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(authParams),
    };
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate authentication parameters',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
