import type { Handler } from '@netlify/functions';
import ImageKit from '@imagekit/nodejs';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
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
        body: JSON.stringify({ error: 'imagePath is required' }),
      };
    }
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body' }),
    };
  }

  try {
    await imagekit.deleteFile(imagePath);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ success: true, imagePath }),
    };
  } catch (error) {
    console.error('ImageKit delete error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
