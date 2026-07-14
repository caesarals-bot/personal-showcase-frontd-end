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

  let imagePath: string;
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    imagePath = body.imagePath;
    if (!imagePath) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'imagePath is required' }),
      };
    }
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid request body' }),
    };
  }

  try {
    await imagekit.deleteFile(imagePath);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, imagePath }),
    };
  } catch (error) {
    console.error('ImageKit delete error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
